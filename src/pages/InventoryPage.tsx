import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Loader } from "@/components/ui/Loader";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MaterialIcon } from "@/components/icons/MaterialIcon";
import { useInventoryAll } from "@/hooks/useInventoryData";
import { formatNumber, formatVND, relativeDays } from "@/lib/format";
import type { Variant, VariantStatus } from "@/types/inventory";

type SortBy = "stock" | "value" | "coverage" | "sales" | "status";

export default function InventoryPage() {
  const q = useInventoryAll();
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("stock");
  const [statusFilter, setStatusFilter] = useState<"all" | VariantStatus>(
    "all",
  );

  const items = useMemo(() => {
    let list: Variant[] = [...(q.data?.variants || [])];
    if (statusFilter !== "all") {
      list = list.filter((v) => v.status === statusFilter);
    }

    const s = query.trim().toLowerCase();
    if (s) {
      list = list.filter(
        (v) =>
          v.vcode.toLowerCase().includes(s) ||
          v.pcode.toLowerCase().includes(s) ||
          v.product.toLowerCase().includes(s) ||
          v.color.toLowerCase().includes(s),
      );
    }

    list.sort((a, b) => {
      if (sortBy === "stock") return a.stock - b.stock;
      if (sortBy === "value") return b.value - a.value;
      if (sortBy === "coverage")
        return (a.coverageDays ?? 9999) - (b.coverageDays ?? 9999);
      if (sortBy === "sales") return b.avgDailySales - a.avgDailySales;
      return a.status.localeCompare(b.status);
    });

    return list;
  }, [q.data?.variants, query, sortBy, statusFilter]);

  return (
    <>
      <PageHeader
        title="Inventory"
        description="All variants with stock, coverage, value and classification."
      />

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 overflow-hidden">
        <div className="p-md border-b border-outline-variant/30 bg-surface-container-low flex flex-col lg:flex-row gap-3 justify-between items-start lg:items-center">
          <div className="relative w-full lg:w-96">
            <MaterialIcon
              name="search"
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search SKU, product, color..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-outline-variant bg-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | VariantStatus)
              }
              className="border border-outline-variant bg-surface rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All statuses</option>
              <option value="low">Low stock</option>
              <option value="out">Out of stock</option>
              <option value="slow">Slow-moving</option>
              <option value="overstock">Overstock</option>
              <option value="no_sales">No sales</option>
              <option value="normal">Normal</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="border border-outline-variant bg-surface rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="stock">Lowest stock</option>
              <option value="value">Highest value</option>
              <option value="coverage">Lowest coverage</option>
              <option value="sales">Highest avg daily sales</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>

        {q.isLoading ? (
          <Loader />
        ) : items.length === 0 ? (
          <EmptyState
            icon="search_off"
            title="No variants found"
            description="Try another keyword or remove filters."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container-low text-xs text-on-surface-variant uppercase">
                <tr>
                  <th className="p-md font-medium">Variant</th>
                  <th className="p-md font-medium">Product</th>
                  <th className="p-md font-medium text-right">Stock</th>
                  <th className="p-md font-medium text-right">Avg/day</th>
                  <th className="p-md font-medium text-right">Coverage</th>
                  <th className="p-md font-medium text-right">Value</th>
                  <th className="p-md font-medium text-right">Last sold</th>
                  <th className="p-md font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {items.slice(0, 500).map((v) => (
                  <tr
                    key={v.vcode}
                    className="hover:bg-surface-container-low transition-colors"
                  >
                    <td className="p-md">
                      <div className="font-mono text-xs text-on-surface">
                        {v.vcode}
                      </div>
                      <div className="text-xs text-on-surface-variant mt-0.5">
                        {v.color}
                        {v.size && ` · ${v.size}`}
                      </div>
                    </td>
                    <td className="p-md">
                      <div className="font-medium text-on-surface truncate max-w-[240px]">
                        {v.product || "—"}
                      </div>
                      <div className="text-xs text-on-surface-variant">
                        {v.pcode}
                      </div>
                    </td>
                    <td className="p-md text-right font-medium">
                      {formatNumber(v.stock)}
                    </td>
                    <td className="p-md text-right text-on-surface-variant">
                      {v.avgDailySales.toFixed(2)}
                    </td>
                    <td className="p-md text-right text-on-surface-variant">
                      {v.coverageDays === null
                        ? "∞"
                        : `${v.coverageDays.toFixed(1)}d`}
                    </td>
                    <td className="p-md text-right text-on-surface">
                      {formatVND(v.value)}
                    </td>
                    <td className="p-md text-right text-on-surface-variant">
                      {relativeDays(v.lastOutAt)}
                    </td>
                    <td className="p-md text-center">
                      <StatusBadge tone={toneFor(v.status)}>
                        {labelFor(v.status)}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {items.length > 500 && (
          <div className="p-sm border-t border-outline-variant/30 text-center text-xs text-on-surface-variant bg-surface-container-low">
            Showing first 500 of {items.length} variants
          </div>
        )}
      </div>
    </>
  );
}

function toneFor(
  status: VariantStatus,
): "critical" | "warning" | "success" | "neutral" | "primary" {
  if (status === "out") return "critical";
  if (status === "low" || status === "slow") return "warning";
  if (status === "overstock") return "primary";
  if (status === "normal") return "success";
  return "neutral";
}

function labelFor(status: VariantStatus): string {
  switch (status) {
    case "low":
      return "Low";
    case "slow":
      return "Slow";
    case "overstock":
      return "Overstock";
    case "out":
      return "Out";
    case "no_sales":
      return "No sales";
    default:
      return "Normal";
  }
}
