import { useState, useMemo } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { MetricSkeleton, Loader } from "@/components/ui/Loader";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MaterialIcon } from "@/components/icons/MaterialIcon";
import { useInventoryAll } from "@/hooks/useInventoryData";
import { formatNumber, formatVND } from "@/lib/format";
import type { Variant } from "@/types/inventory";

export function toneFor(status: Variant["status"]) {
  switch (status) {
    case "normal":
      return "success";
    case "low":
      return "warning";
    case "out":
      return "critical";
    case "overstock":
      return "primary";
    case "slow":
      return "neutral";
    case "no_sales":
      return "neutral";
    default:
      return "neutral";
  }
}

export function labelFor(status: Variant["status"]) {
  switch (status) {
    case "normal":
      return "OK";
    case "low":
      return "Sắp hết";
    case "out":
      return "Hết hàng";
    case "overstock":
      return "Tồn cao";
    case "slow":
      return "Chậm luân chuyển";
    case "no_sales":
      return "Chưa bán";
    default:
      return "Unknown";
  }
}

export default function InventoryPage() {
  const q = useInventoryAll();
  const data = q.data;
  const summary = data?.summary;
  const variants = data?.variants || [];

  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return variants;
    const s = search.toLowerCase();
    return variants.filter(
      (v) =>
        v.vcode.toLowerCase().includes(s) ||
        (v.product && v.product.toLowerCase().includes(s)) ||
        (v.pcode && v.pcode.toLowerCase().includes(s)),
    );
  }, [variants, search]);

  return (
    <>
      <PageHeader
        title="Danh mục Tồn kho"
        description="Quản lý toàn bộ SKU, theo dõi số lượng và trạng thái."
        actions={
          <>
            <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-label-md text-sm hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
              <MaterialIcon name="filter_list" size={18} /> Lọc
            </button>
            <button className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md text-sm hover:opacity-90 transition-opacity shadow-sm flex items-center gap-2">
              <MaterialIcon name="download" size={18} /> Xuất file CSV
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {q.isLoading || !summary ? (
          <>
            <MetricSkeleton />
            <MetricSkeleton />
            <MetricSkeleton />
            <MetricSkeleton />
          </>
        ) : (
          <>
            <MetricCard
              label="Tổng số SKU"
              icon="category"
              value={formatNumber(summary.totalVariants)}
              hint={`Thuộc ${formatNumber(summary.totalProducts)} Sản phẩm`}
              tone="primary"
            />
            <MetricCard
              label="SKU Sắp hết hàng"
              icon="warning"
              value={formatNumber(summary.lowStockCount)}
              hint="Cần bổ sung sớm"
              tone="error"
            />
            <MetricCard
              label="Hết hàng"
              icon="block"
              value={formatNumber(summary.outOfStockCount)}
              hint="Tồn kho = 0"
              tone="default"
            />
            <MetricCard
              label="Chậm luân chuyển"
              icon="hourglass_bottom"
              value={formatNumber(summary.slowMovingCount)}
              hint="Bán chậm"
              tone="warning"
            />
          </>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
          <h2 className="text-lg font-bold text-slate-900 font-headline-md">
            Danh sách SKU
          </h2>
          <div className="relative w-full md:w-80">
            <MaterialIcon
              name="search"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Tìm theo mã SKU, tên sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow"
            />
          </div>
        </div>

        {q.isLoading ? (
          <div className="p-8"><Loader /></div>
        ) : filtered.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <EmptyState
              icon="search_off"
              title="Không tìm thấy SKU"
              description={
                search
                  ? `Không có kết quả nào cho "${search}"`
                  : "Chưa có dữ liệu tồn kho."
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50/50 border-b border-slate-200 text-xs text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6 font-semibold">Mã SKU</th>
                  <th className="py-4 px-6 font-semibold">Sản phẩm</th>
                  <th className="py-4 px-6 font-semibold text-right">Giá gốc</th>
                  <th className="py-4 px-6 font-semibold text-right">Tồn kho</th>
                  <th className="py-4 px-6 font-semibold text-right">Tốc độ (ngày)</th>
                  <th className="py-4 px-6 font-semibold text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.slice(0, 100).map((v) => (
                  <tr
                    key={v.vcode}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 font-mono text-xs">{v.vcode}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 text-sm max-w-[240px] truncate">
                        {v.product || "—"}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {v.pcode} · {v.color} {v.size && `· ${v.size}`}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right text-slate-600 font-medium">
                      {v.costPrice !== null ? formatVND(v.costPrice) : "—"}
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-slate-900">
                      {formatNumber(v.stock)}
                    </td>
                    <td className="py-4 px-6 text-right text-slate-600">
                      {v.avgDailySales.toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-center">
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

        {filtered.length > 100 && (
          <div className="p-4 border-t border-slate-200 text-center text-xs text-slate-500 bg-slate-50/50">
            Đang hiển thị 100 / {filtered.length} kết quả (Sử dụng thanh tìm kiếm để lọc)
          </div>
        )}
      </div>
    </>
  );
}
