/**
 * StockMaster Pro – Google Apps Script backend (v2 — snapshot + velocity)
 *
 * Endpoints (all GET):
 *   ?route=snapshot         → current stock per variant (from gid=2125225444)
 *   ?route=velocity&days=28 → avg daily sales + first-intake + last-in/out per vcode (from gid=490379386)
 *   ?route=all              → combined { snapshot, velocity } (recommended for frontend)
 *   ?refresh=1              → bypass cache
 *
 * Deploy:
 *   1. Open the bound Apps Script editor for the sheet.
 *   2. Replace the file content with this script.
 *   3. Deploy → New deployment → Web app
 *      - Execute as: Me
 *      - Who has access: Anyone
 *   4. Copy /exec URL → set as VITE_GAS_URL in frontend .env.
 */

// ======== CONFIG ========
const SHEET_ID = "1lBTzufSZSW5BuRqBYtB8Cbl7J1lhb9quV-KOaT2lhHc";
const GID_SNAPSHOT = 2125225444; // "danh sách tồn kho"
const GID_LOG = 490379386; // "Nhật ký kho"
const CACHE_TTL_SEC = 600; // 10 minutes
const DEFAULT_VELOCITY_DAYS = 28;
// =========================

function doGet(e) {
  try {
    const params = (e && e.parameter) || {};
    const route = (params.route || "all").toLowerCase();
    const refresh = params.refresh === "1";
    const days = Math.max(
      1,
      parseInt(params.days, 10) || DEFAULT_VELOCITY_DAYS,
    );

    const cacheKey = "smv2_" + route + "_" + days;
    const cache = CacheService.getScriptCache();
    if (!refresh) {
      const cached = cache.get(cacheKey);
      if (cached) return jsonOut(JSON.parse(cached));
    }

    let payload;
    switch (route) {
      case "snapshot":
        payload = loadSnapshot(refresh);
        break;
      case "velocity":
        payload = loadVelocity(days, refresh);
        break;
      case "all": {
        const snap = loadSnapshot(refresh);
        const vel = loadVelocity(days, refresh);
        payload = { snapshot: snap, velocity: vel };
        break;
      }
      case "debug-snapshot": {
        const sheet = getSheetByGid(
          SpreadsheetApp.openById(SHEET_ID),
          GID_SNAPSHOT,
        );
        const v = sheet.getDataRange().getValues().slice(0, 30);
        payload = { preview: v };
        break;
      }
      default:
        return jsonOut({
          error: "Unknown route: " + route,
          availableRoutes: ["snapshot", "velocity", "all"],
        });
    }

    const result = {
      route: route,
      generatedAt: new Date().toISOString(),
      days: route === "velocity" || route === "all" ? days : undefined,
      data: payload,
    };
    try {
      cache.put(cacheKey, JSON.stringify(result), CACHE_TTL_SEC);
    } catch (err) {
      /* payload > 100KB, skip cache */
    }
    return jsonOut(result);
  } catch (err) {
    return jsonOut({ error: err.message, stack: err.stack });
  }
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

// ======== SNAPSHOT (gid=2125225444) ========

/**
 * Parse the hierarchical inventory snapshot sheet.
 *
 * Layout (based on observed export):
 *   Row 1: super headers (THÔNG TIN SP / PHÂN LOẠI / GIÁ SX / TỒN KHO)
 *   Row 2: column headers (STT, TÊN MẪU, MÃ SP, XƯỞNG, KIỂU DÁNG, FORM, HÌNH, DANH MỤC, …)
 *   Parent row (per product):
 *     A=STT(numeric), B=TÊN MẪU, C=MÃ SP (pcode), D=XƯỞNG, E=KIỂU DÁNG,
 *     F=FORM, G=HÌNH, H=DANH MỤC, I=classification?, J="GIÁ SX" (e.g. "160,000 đ"),
 *     K=total stock (may be comma formatted), L=total value, M=ratio %
 *   Sub-header row (sometimes repeated inside a group): C="MÃ SP", D="MÀU", E="SIZE"…
 *   Variant row:
 *     A=pcode, B=vcode, C=pcode, D=MÀU, E=SIZE, I=classification (CHỦ LỰC/BÁN CHẠY/KHÔNG RESTOCK),
 *     J=DAY (0/1 integer), K=stock (numeric), L=value formatted, M=blank
 */
function loadSnapshot(refresh) {
  const cache = CacheService.getScriptCache();
  const key = "smv2_snapshot_raw";
  if (!refresh) {
    const cached = cache.get(key);
    if (cached) return JSON.parse(cached);
  }

  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = getSheetByGid(ss, GID_SNAPSHOT);
  if (!sheet) throw new Error("Snapshot sheet not found: gid=" + GID_SNAPSHOT);

  const values = sheet.getDataRange().getValues();
  const variants = [];
  const products = {};
  const categories = {};
  let currentProduct = null;

  for (let r = 0; r < values.length; r++) {
    const row = values[r];
    const A = cellStr(row[0]);
    const B = cellStr(row[1]);
    const C = cellStr(row[2]);
    const D = cellStr(row[3]);
    const E = cellStr(row[4]);
    const H = cellStr(row[7]);
    const I = cellStr(row[8]);
    const J = row[9];
    const K = row[10];
    const L = row[11];

    // Skip empty / divider rows
    if (!A && !B && !C) continue;

    // Skip super-header row
    if (A === "THÔNG TIN SP" || B === "TÊN MẪU" || C === "MÃ SP") continue;

    // Detect parent row: A is numeric (STT), B is product name, C is pcode,
    // and J looks like a price (contains "đ" or is a large number and K has total stock)
    const stt = Number(A);
    const parentLike =
      !isNaN(stt) &&
      stt > 0 &&
      B &&
      C &&
      (containsCurrency(J) || (numeric(J) > 0 && numeric(K) > numeric(J)));

    if (parentLike) {
      currentProduct = {
        pcode: C,
        name: B,
        workshop: D,
        style: E,
        category: H || "UNCATEGORIZED",
        classification: I || "",
        costPrice: parseCurrency(J),
        totalStock: numeric(K),
        totalValue: parseCurrency(L),
        variantCount: 0,
      };
      products[C] = currentProduct;
      if (currentProduct.category) categories[currentProduct.category] = true;
      continue;
    }

    // Detect variant row: B is a vcode (contains dash or equals pcode), C equals B's pcode prefix,
    // J is numeric and small (DAY flag 0/1), K numeric (stock)
    const isVariant = B && C && !containsCurrency(J) && isFiniteNumber(K);

    if (!isVariant) continue;

    const pcode = C;
    const vcode = B;
    const color = D;
    const size = E;
    const classification = I;
    const stock = numeric(K);
    const value = parseCurrency(L);
    const costPrice = stock > 0 && value > 0 ? Math.round(value / stock) : 0;

    const product =
      currentProduct && currentProduct.pcode === pcode
        ? currentProduct
        : products[pcode];
    const productName =
      (product && product.name) || (vcode === pcode ? vcode : pcode);
    const category = (product && product.category) || "UNCATEGORIZED";
    const classificationFinal =
      classification || (product && product.classification) || "";

    if (product) product.variantCount += 1;
    if (category) categories[category] = true;

    variants.push({
      vcode: vcode,
      pcode: pcode,
      product: productName,
      color: color,
      size: size,
      category: category,
      classification: classificationFinal,
      stock: stock,
      costPrice: costPrice,
      value: value,
    });
  }

  // For products that don't appear as parent (simple products like BO6/VO5 where
  // only variant rows exist), synthesize a lightweight product entry.
  variants.forEach(function (v) {
    if (!products[v.pcode]) {
      products[v.pcode] = {
        pcode: v.pcode,
        name: v.product,
        category: v.category,
        classification: v.classification,
        costPrice: v.costPrice,
        totalStock: 0,
        totalValue: 0,
        variantCount: 0,
      };
    }
  });

  // Re-aggregate product totals from variants to stay consistent
  Object.keys(products).forEach(function (pc) {
    const p = products[pc];
    p.totalStock = 0;
    p.totalValue = 0;
    p.variantCount = 0;
  });
  variants.forEach(function (v) {
    const p = products[v.pcode];
    if (!p) return;
    p.totalStock += v.stock || 0;
    p.totalValue += v.value || 0;
    p.variantCount += 1;
  });

  const snapshot = {
    asOf: new Date().toISOString(),
    variantCount: variants.length,
    productCount: Object.keys(products).length,
    variants: variants,
    products: products,
    categories: Object.keys(categories).sort(),
  };

  try {
    cache.put(key, JSON.stringify(snapshot), CACHE_TTL_SEC);
  } catch (err) {
    /* too large, skip */
  }
  return snapshot;
}

// ======== VELOCITY (gid=490379386) ========

/**
 * Parse the transaction log and compute per-vcode:
 *   - avgDailySales (sum of xuất-kho within `days` / days)
 *   - totalIn (in `days`)
 *   - totalOut (in `days`)
 *   - firstIntakeAt (earliest Nhập kho across all history)
 *   - lastInAt, lastOutAt (most recent)
 *   - txnCount (in `days`)
 */
function loadVelocity(days, refresh) {
  const cache = CacheService.getScriptCache();
  const key = "smv2_velocity_" + days;
  if (!refresh) {
    const cached = cache.get(key);
    if (cached) return JSON.parse(cached);
  }

  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = getSheetByGid(ss, GID_LOG);
  if (!sheet) throw new Error("Log sheet not found: gid=" + GID_LOG);

  const values = sheet.getDataRange().getValues();
  if (values.length < 2)
    return { days: days, asOf: new Date().toISOString(), byVcode: {} };

  const header = values[0].map(function (h) {
    return cellStr(h);
  });
  const idx = {
    action: header.indexOf("Hành động"),
    datetime: header.indexOf("Ngày giờ"),
    vcode: header.indexOf("Mã mẫu mã"),
    change: header.indexOf("Thay đổi"),
  };
  if (idx.vcode === -1 || idx.action === -1) {
    throw new Error(
      "Log sheet missing required columns (Mã mẫu mã / Hành động)",
    );
  }

  const now = new Date();
  const windowMs = days * 24 * 60 * 60 * 1000;
  const windowStart = new Date(now.getTime() - windowMs);

  const byVcode = {};

  for (let r = 1; r < values.length; r++) {
    const row = values[r];
    const vcode = cellStr(row[idx.vcode]);
    if (!vcode) continue;
    const action = cellStr(row[idx.action]);
    const ts = parseDateTime(row[idx.datetime]);
    const change = Math.abs(numeric(row[idx.change]));

    let v = byVcode[vcode];
    if (!v) {
      v = byVcode[vcode] = {
        avgDailySales: 0,
        totalIn: 0,
        totalOut: 0,
        totalInWindow: 0,
        totalOutWindow: 0,
        txnCount: 0,
        firstIntakeAt: null,
        lastInAt: null,
        lastOutAt: null,
      };
    }

    if (action === "Nhập kho") {
      v.totalIn += change;
      if (ts) {
        if (!v.firstIntakeAt || ts < v.firstIntakeAt) v.firstIntakeAt = ts;
        if (!v.lastInAt || ts > v.lastInAt) v.lastInAt = ts;
        if (ts >= windowStart) {
          v.totalInWindow += change;
          v.txnCount += 1;
        }
      }
    } else if (action === "Xuất kho") {
      v.totalOut += change;
      if (ts) {
        if (!v.lastOutAt || ts > v.lastOutAt) v.lastOutAt = ts;
        if (ts >= windowStart) {
          v.totalOutWindow += change;
          v.txnCount += 1;
        }
      }
    }
  }

  // Finalize + serialize dates
  const out = {};
  Object.keys(byVcode).forEach(function (vc) {
    const v = byVcode[vc];
    out[vc] = {
      avgDailySales: v.totalOutWindow / days,
      totalInWindow: v.totalInWindow,
      totalOutWindow: v.totalOutWindow,
      totalIn: v.totalIn,
      totalOut: v.totalOut,
      txnCount: v.txnCount,
      firstIntakeAt: v.firstIntakeAt ? v.firstIntakeAt.toISOString() : null,
      lastInAt: v.lastInAt ? v.lastInAt.toISOString() : null,
      lastOutAt: v.lastOutAt ? v.lastOutAt.toISOString() : null,
    };
  });

  const result = {
    days: days,
    asOf: new Date().toISOString(),
    vcodeCount: Object.keys(out).length,
    byVcode: out,
  };
  try {
    cache.put(key, JSON.stringify(result), CACHE_TTL_SEC);
  } catch (err) {
    /* too large */
  }
  return result;
}

// ======== UTIL ========

function getSheetByGid(ss, gid) {
  const sheets = ss.getSheets();
  for (let i = 0; i < sheets.length; i++) {
    if (sheets[i].getSheetId() === gid) return sheets[i];
  }
  return null;
}

function cellStr(v) {
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

function isFiniteNumber(v) {
  if (v === null || v === undefined || v === "") return false;
  if (typeof v === "number") return isFinite(v);
  const s = String(v).replace(/[,\s]/g, "");
  if (!s) return false;
  const n = Number(s);
  return isFinite(n);
}

function numeric(v) {
  if (v === null || v === undefined || v === "") return 0;
  if (typeof v === "number") return v;
  const s = String(v).replace(/[,\s]/g, "");
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

function containsCurrency(v) {
  if (v === null || v === undefined) return false;
  return /đ/i.test(String(v));
}

function parseCurrency(v) {
  if (v === null || v === undefined || v === "") return 0;
  if (typeof v === "number") return v;
  const s = String(v).replace(/đ/gi, "").replace(/[,\s]/g, "").trim();
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

function parseDateTime(v) {
  if (!v) return null;
  if (v instanceof Date) return v;
  const s = String(v).trim();
  // "HH:mm:ss dd/MM/yyyy"
  const m = s.match(
    /^(\d{1,2}):(\d{2}):(\d{2})\s+(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
  );
  if (m) {
    return new Date(+m[6], +m[5] - 1, +m[4], +m[1], +m[2], +m[3]);
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

// ======== DEV TEST (run in editor) ========
function testAll() {
  const s = loadSnapshot(true);
  Logger.log("variants=%s products=%s", s.variantCount, s.productCount);
  Logger.log("first variant: %s", JSON.stringify(s.variants[0]));
  const v = loadVelocity(28, true);
  Logger.log("velocity vcodes=%s", v.vcodeCount);
  const sample = Object.keys(v.byVcode)[0];
  Logger.log("sample vel: %s = %s", sample, JSON.stringify(v.byVcode[sample]));
}
