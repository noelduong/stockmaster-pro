# GAS Backend — StockMaster Pro v2

**File**: `Code.gs`
**Sheet**: https://docs.google.com/spreadsheets/d/1lBTzufSZSW5BuRqBYtB8Cbl7J1lhb9quV-KOaT2lhHc/edit
**Source tabs**:

- `gid=2125225444` — "danh sách tồn kho" (snapshot, hierarchical)
- `gid=490379386` — "Nhật ký kho" (transaction log)

---

## Endpoints

| Route                   | Query                | Response shape                                                                         |
| ----------------------- | -------------------- | -------------------------------------------------------------------------------------- |
| `?route=snapshot`       | —                    | `{ data: { asOf, variantCount, productCount, variants[], products{}, categories[] } }` |
| `?route=velocity`       | `days=28` (optional) | `{ data: { days, asOf, vcodeCount, byVcode: { [vcode]: {...} } } }`                    |
| `?route=all`            | `days=28`            | `{ data: { snapshot, velocity } }` — recommended for frontend                          |
| `?route=debug-snapshot` | —                    | first 30 rows for inspection                                                           |
| `?refresh=1`            | any route            | bypass cache                                                                           |

### Variant shape

```json
{
  "vcode": "PO88-DEN-L",
  "pcode": "PO88",
  "product": "BASIC SYMBOL",
  "color": "ĐEN",
  "size": "L",
  "category": "ÁO POLO",
  "classification": "SẢN PHẨM CHỦ LỰC",
  "stock": 313,
  "costPrice": 112860,
  "value": 35325180
}
```

### Velocity shape

```json
{
  "avgDailySales": 12.5,
  "totalInWindow": 120,
  "totalOutWindow": 350,
  "totalIn": 4200,
  "totalOut": 3180,
  "txnCount": 48,
  "firstIntakeAt": "2024-06-10T08:12:44.000Z",
  "lastInAt": "2026-04-13T17:35:18.000Z",
  "lastOutAt": "2026-04-13T17:39:35.000Z"
}
```

---

## Deploy

1. Open the sheet → **Extensions → Apps Script**
2. Delete existing `Code.gs` content, paste content of `gas/Code.gs` from this repo
3. **Save** (Ctrl+S)
4. **Run** → `testAll` once → authorize prompts (grant access to the sheet)
5. **Deploy → New deployment**
   - Type: **Web app**
   - Description: `StockMaster Pro v2`
   - Execute as: **Me** (the sheet owner)
   - Who has access: **Anyone**
   - Click **Deploy**
6. Copy the `/exec` URL → paste to `.env.local` as `VITE_GAS_URL`
7. If you re-edit Code.gs later, redeploy with **Deploy → Manage deployments → Edit → Version: New version**

---

## Smoke test (PowerShell)

```powershell
$URL = "https://script.google.com/macros/s/YOUR_DEPLOY_ID/exec"
curl.exe "$URL?route=snapshot" -o snap.json
curl.exe "$URL?route=velocity&days=28" -o vel.json
curl.exe "$URL?route=all" -o all.json
Get-Content all.json | Select-Object -First 1 | Select-String -Pattern "variantCount"
```

---

## Cache

- TTL: **600s (10 min)**
- Key prefix: `smv2_*`
- Bypass: append `&refresh=1`

## Troubleshooting

- **403 / permission error** when loading GAS: ensure Web app `Who has access: Anyone`, re-deploy with "New version"
- **Empty variants**: open `?route=debug-snapshot` → inspect first 30 rows; the snapshot tab structure may have drifted
- **All statuses wrong**: use `?refresh=1` once to flush cache
