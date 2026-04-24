// ======== StockMaster Pro v2 — types ========

export type VariantStatus =
  | "low" // coverage < LOW_COVERAGE
  | "slow" // coverage > SLOW_COVERAGE, not overstock
  | "overstock" // coverage > SLOW_COVERAGE && age >= OVERSTOCK_MIN_AGE
  | "out" // stock <= 0
  | "no_sales" // avgDailySales == 0 with stock > 0
  | "normal"; // everything else

export interface Thresholds {
  /** coverage below which a variant is considered low-stock (days) */
  lowCoverage: number;
  /** coverage above which a variant is considered slow-moving (days) */
  slowCoverage: number;
  /** minimum days since first intake before slow-moving is promoted to overstock */
  overstockMinAge: number;
  /** rolling window (days) used to compute velocity */
  velocityDays: number;
}

export const DEFAULT_THRESHOLDS: Thresholds = {
  lowCoverage: 14,
  slowCoverage: 56,
  overstockMinAge: 28,
  velocityDays: 28,
};

// ========================================================================
// Raw shapes (what GAS returns)
// ========================================================================

export interface RawVariant {
  vcode: string;
  pcode: string;
  product: string;
  color: string;
  size: string;
  category: string;
  classification: string;
  stock: number;
  costPrice: number;
  value: number;
}

export interface RawProduct {
  pcode: string;
  name: string;
  category: string;
  classification: string;
  costPrice: number;
  totalStock: number;
  totalValue: number;
  variantCount: number;
}

export interface VelocityEntry {
  avgDailySales: number;
  totalInWindow: number;
  totalOutWindow: number;
  totalIn: number;
  totalOut: number;
  txnCount: number;
  firstIntakeAt: string | null;
  lastInAt: string | null;
  lastOutAt: string | null;
}

export interface SnapshotPayload {
  asOf: string;
  variantCount: number;
  productCount: number;
  variants: RawVariant[];
  products: Record<string, RawProduct>;
  categories: string[];
}

export interface VelocityPayload {
  days: number;
  asOf: string;
  vcodeCount: number;
  byVcode: Record<string, VelocityEntry>;
}

export interface ApiEnvelope<T> {
  route: string;
  generatedAt: string;
  days?: number;
  data: T;
}

// ========================================================================
// Derived shapes (what the app uses)
// ========================================================================

export interface Variant extends RawVariant {
  // velocity
  avgDailySales: number;
  totalInWindow: number;
  totalOutWindow: number;
  totalIn: number;
  totalOut: number;
  txnCount: number;
  firstIntakeAt: string | null;
  lastInAt: string | null;
  lastOutAt: string | null;
  daysSinceFirstIntake: number | null;
  daysSinceOut: number | null;
  // derived
  coverageDays: number | null; // null if avgDailySales == 0
  status: VariantStatus;
  inSizeGap: boolean;
}

export interface Product extends RawProduct {
  hasSizeGap: boolean;
  statusCounts: Record<VariantStatus, number>;
}

export interface SizeGapGroup {
  key: string; // pcode||color
  pcode: string;
  product: string;
  color: string;
  category: string;
  variants: Variant[];
  presentSizes: string[];
  outOfStockSizes: string[];
  inStockSizes: string[];
  totalStock: number;
  missingRatio: number; // outOfStockSizes / presentSizes
}

export interface DashboardSummary {
  asOf: string;
  totalInventoryValue: number;
  totalVariants: number;
  totalProducts: number;
  outOfStockCount: number;
  lowStockCount: number;
  slowMovingCount: number;
  overstockCount: number;
  noSalesCount: number;
  normalCount: number;
  sizeGapGroupCount: number;
  valueLockedOverstock: number; // sum(value) of overstock variants
  valueLockedSlow: number; // sum(value) of slow-moving variants
  valueAtRiskLowStock: number; // sum(value) of low-stock
  topCategoryByValue: Array<{ category: string; value: number }>;
}

export interface InventoryAll {
  snapshot: SnapshotPayload;
  velocity: VelocityPayload;
  variants: Variant[];
  products: Product[];
  sizeGaps: SizeGapGroup[];
  summary: DashboardSummary;
  asOf: string;
}

export type DataSourceMode = "gas" | "csv";
