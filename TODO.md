# StockMaster Pro — Refactor TODO

## Schema change: txn-log only → snapshot + velocity with 4-status model

### Status Rules (confirmed)

- **Low-stock**: `coverage < 14 days`
- **Slow-moving**: `coverage > 56 days`
- **Overstock**: `coverage > 56` AND `daysSinceFirstIntake ≥ 28`
- **Size-gap**: within (pcode+màu), ≥1 variant stock=0 while sibling >0
- **No-sales** (Option B): variant với `avgDailySales=0` → tách riêng, không tính vào low/slow/overstock

---

## Phase A — GAS Backend (gas/Code.gs)

- [x] Rewrite GAS with 3 endpoints
  - [x] `?route=snapshot` — parse gid=2125225444 (hierarchical)
  - [x] `?route=velocity&days=28` — parse gid=490379386 (txn log)
  - [x] `?route=all` — combined
  - [x] Cache 600s, refresh=1 bypass
- [ ] User re-deploys GAS, verifies endpoints via curl

## Phase B — Frontend Refactor

- [x] `src/types/inventory.ts` — new schema
- [x] `src/lib/config.ts` — add SNAPSHOT_GID, LOG_GID
- [x] `src/lib/analytics.ts` — computeStatus, detectSizeGaps, buildSummary
- [x] `src/lib/api.ts` — single fetchAll + CSV fallback
- [x] `src/hooks/useInventoryData.ts` — useInventoryAll + selectors
- [x] `src/store/useInventoryStore.ts` — filters/selectors state
- [x] `src/components/ui/StatusBadge.tsx` — add low/slow/overstock/no_sales tones
- [x] `src/components/ui/MetricCard.tsx` — tone matching
- [x] `src/components/layout/SideNav.tsx` — menu labels (VN + icons)
- [x] `src/pages/DashboardPage.tsx` — 4 metric cards + SizeGap + NoSales widgets + Top 5
- [x] `src/pages/InventoryPage.tsx` — table w/ status, coverage, category/classification filters
- [x] `src/pages/StockGapsPage.tsx` — tabs Low-Stock + Size-Gap
- [x] `src/pages/OverstockPage.tsx` — Slow-moving + Overstock sections
- [x] `src/pages/IntakePage.tsx` — recent intakes grouped by day
- [x] `src/pages/ReportsPage.tsx` — bar chart by category + classification
- [x] Delete obsolete `src/lib/aggregate.ts`

## Phase C — Deploy

- [x] `.env.example` + `.env.local` (VITE_GAS_URL etc.)
- [x] `.github/workflows/deploy.yml`
- [ ] `git init`, commit, push to `noelduong/stockmaster-pro`
- [ ] Enable GitHub Pages (source: gh-pages branch) — user action
- [ ] Verify prod URL
