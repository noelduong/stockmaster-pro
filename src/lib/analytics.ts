import {
  DEFAULT_THRESHOLDS,
  type DashboardSummary,
  type Product,
  type RawVariant,
  type SizeGapGroup,
  type SnapshotPayload,
  type Thresholds,
  type Variant,
  type VariantStatus,
  type VelocityEntry,
  type VelocityPayload,
} from "@/types/inventory";

const DAY_MS = 86_400_000;

function daysBetween(iso: string | null, now: number): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  return Math.max(0, Math.floor((now - t) / DAY_MS));
}

function computeCoverage(stock: number, avgDailySales: number): number | null {
  if (stock <= 0) return 0;
  if (avgDailySales <= 0) return null; // no-sales → infinite
  return stock / avgDailySales;
}

function classifyStatus(
  stock: number,
  coverage: number | null,
  avgDailySales: number,
  daysSinceFirstIntake: number | null,
  t: Thresholds,
): VariantStatus {
  if (stock <= 0) return "out";
  if (avgDailySales <= 0) return "no_sales";
  if (coverage === null) return "no_sales";
  if (coverage < t.lowCoverage) return "low";
  if (coverage > t.slowCoverage) {
    if (
      daysSinceFirstIntake !== null &&
      daysSinceFirstIntake >= t.overstockMinAge
    ) {
      return "overstock";
    }
    return "slow";
  }
  return "normal";
}

export function enrichVariants(
  snapshot: SnapshotPayload,
  velocity: VelocityPayload,
  thresholds: Thresholds = DEFAULT_THRESHOLDS,
  nowMs: number = Date.now(),
): Variant[] {
  const rawList: RawVariant[] = snapshot.variants || [];
  const byVcode = velocity.byVcode || {};
  return rawList.map((r) => {
    const v: VelocityEntry = byVcode[r.vcode] || {
      avgDailySales: 0,
      totalInWindow: 0,
      totalOutWindow: 0,
      totalIn: 0,
      totalOut: 0,
      txnCount: 0,
      firstIntakeAt: null,
      lastInAt: null,
      lastOutAt: null,
    };
    const coverage = computeCoverage(r.stock, v.avgDailySales);
    const daysSinceFirstIntake = daysBetween(v.firstIntakeAt, nowMs);
    const daysSinceOut = daysBetween(v.lastOutAt, nowMs);
    const status = classifyStatus(
      r.stock,
      coverage,
      v.avgDailySales,
      daysSinceFirstIntake,
      thresholds,
    );
    return {
      ...r,
      avgDailySales: v.avgDailySales,
      totalInWindow: v.totalInWindow,
      totalOutWindow: v.totalOutWindow,
      totalIn: v.totalIn,
      totalOut: v.totalOut,
      txnCount: v.txnCount,
      firstIntakeAt: v.firstIntakeAt,
      lastInAt: v.lastInAt,
      lastOutAt: v.lastOutAt,
      daysSinceFirstIntake,
      daysSinceOut,
      coverageDays: coverage,
      status,
      inSizeGap: false, // will be set by detectSizeGaps
    };
  });
}

/**
 * Size-gap: within a (pcode, color) group, at least one variant stock=0 while
 * at least one sibling has stock>0.
 */
export function detectSizeGaps(variants: Variant[]): SizeGapGroup[] {
  const map = new Map<string, SizeGapGroup>();
  for (const v of variants) {
    // ignore rows with no color/size
    if (!v.size) continue;
    const colorKey = v.color || "_";
    const key = `${v.pcode}||${colorKey}`;
    let g = map.get(key);
    if (!g) {
      g = {
        key,
        pcode: v.pcode,
        product: v.product,
        color: v.color,
        category: v.category,
        variants: [],
        presentSizes: [],
        outOfStockSizes: [],
        inStockSizes: [],
        totalStock: 0,
        missingRatio: 0,
      };
      map.set(key, g);
    }
    g.variants.push(v);
    if (!g.presentSizes.includes(v.size)) g.presentSizes.push(v.size);
    g.totalStock += v.stock;
    if (v.stock <= 0) {
      if (!g.outOfStockSizes.includes(v.size)) g.outOfStockSizes.push(v.size);
    } else {
      if (!g.inStockSizes.includes(v.size)) g.inStockSizes.push(v.size);
    }
  }
  const out: SizeGapGroup[] = [];
  for (const g of map.values()) {
    if (g.presentSizes.length <= 1) continue; // needs siblings
    if (g.outOfStockSizes.length === 0) continue;
    if (g.inStockSizes.length === 0) continue; // fully out is not "gap"
    g.missingRatio = g.outOfStockSizes.length / g.presentSizes.length;
    out.push(g);
  }
  // Mark in-gap variants (the out-of-stock ones in a partial group)
  for (const g of out) {
    for (const v of g.variants) {
      if (v.stock <= 0) v.inSizeGap = true;
    }
  }
  out.sort((a, b) => b.missingRatio - a.missingRatio);
  return out;
}

export function buildProducts(variants: Variant[]): Product[] {
  const map = new Map<string, Product>();
  for (const v of variants) {
    let p = map.get(v.pcode);
    if (!p) {
      p = {
        pcode: v.pcode,
        name: v.product,
        category: v.category,
        classification: v.classification,
        costPrice: v.costPrice,
        totalStock: 0,
        totalValue: 0,
        variantCount: 0,
        hasSizeGap: false,
        statusCounts: {
          low: 0,
          slow: 0,
          overstock: 0,
          out: 0,
          no_sales: 0,
          normal: 0,
        },
      };
      map.set(v.pcode, p);
    }
    p.variantCount += 1;
    p.totalStock += v.stock;
    p.totalValue += v.value;
    p.statusCounts[v.status] += 1;
    if (v.inSizeGap) p.hasSizeGap = true;
  }
  return Array.from(map.values()).sort((a, b) => b.totalValue - a.totalValue);
}

export function buildSummary(
  variants: Variant[],
  sizeGaps: SizeGapGroup[],
  products: Product[],
  asOf: string,
): DashboardSummary {
  let totalInventoryValue = 0;
  let outOfStockCount = 0;
  let lowStockCount = 0;
  let slowMovingCount = 0;
  let overstockCount = 0;
  let noSalesCount = 0;
  let normalCount = 0;
  let valueLockedOverstock = 0;
  let valueLockedSlow = 0;
  let valueAtRiskLowStock = 0;
  const byCategory = new Map<string, number>();

  for (const v of variants) {
    totalInventoryValue += v.value;
    byCategory.set(v.category, (byCategory.get(v.category) || 0) + v.value);
    switch (v.status) {
      case "out":
        outOfStockCount += 1;
        break;
      case "low":
        lowStockCount += 1;
        valueAtRiskLowStock += v.value;
        break;
      case "slow":
        slowMovingCount += 1;
        valueLockedSlow += v.value;
        break;
      case "overstock":
        overstockCount += 1;
        valueLockedOverstock += v.value;
        break;
      case "no_sales":
        noSalesCount += 1;
        break;
      case "normal":
        normalCount += 1;
        break;
    }
  }

  const topCategoryByValue = Array.from(byCategory.entries())
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  return {
    asOf,
    totalInventoryValue,
    totalVariants: variants.length,
    totalProducts: products.length,
    outOfStockCount,
    lowStockCount,
    slowMovingCount,
    overstockCount,
    noSalesCount,
    normalCount,
    sizeGapGroupCount: sizeGaps.length,
    valueLockedOverstock,
    valueLockedSlow,
    valueAtRiskLowStock,
    topCategoryByValue,
  };
}

export const STATUS_LABEL: Record<VariantStatus, string> = {
  low: "Sắp hết",
  slow: "Chậm luân chuyển",
  overstock: "Tồn cao",
  out: "Hết hàng",
  no_sales: "Chưa phát sinh bán",
  normal: "Bình thường",
};

export const STATUS_COLOR: Record<VariantStatus, string> = {
  low: "bg-error-container text-on-error-container",
  slow: "bg-warning-container text-on-warning-container",
  overstock: "bg-tertiary-container text-on-tertiary-container",
  out: "bg-error text-on-error",
  no_sales: "bg-surface-container-high text-on-surface-variant",
  normal: "bg-success-container text-on-success-container",
};
