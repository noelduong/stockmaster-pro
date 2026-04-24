import { PageHeader } from "@/components/ui/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { MetricSkeleton, Loader } from "@/components/ui/Loader";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MaterialIcon } from "@/components/icons/MaterialIcon";
import { useInventoryAll } from "@/hooks/useInventoryData";
import { formatNumber, formatVND, relativeDays } from "@/lib/format";
import type { Variant } from "@/types/inventory";
import { toneFor, labelFor } from "@/pages/InventoryPage";

export default function OverstockPage() {
  const q = useInventoryAll();
  const data = q.data;
  const items = (data?.variants || []).filter(
    (v) => v.status === "overstock" || v.status === "slow",
  );

  const sorted = items.sort(
    (a, b) => (a.daysSinceFirstIntake || 0) - (b.daysSinceFirstIntake || 0),
  );
  const summary = data?.summary;

  return (
    <>
      <PageHeader
        title="Chi tiết Tồn kho lâu"
        description="Overstock & slow-moving inventory cần xử lý (clearance)."
        actions={
          <>
            <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-label-md text-sm hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
              <MaterialIcon name="filter_list" size={18} /> Lọc
            </button>
            <button className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md text-sm hover:opacity-90 transition-opacity shadow-sm flex items-center gap-2">
              <MaterialIcon name="download" size={18} /> Xuất báo cáo
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {q.isLoading || !summary ? (
          <>
            <MetricSkeleton />
            <MetricSkeleton />
            <MetricSkeleton />
          </>
        ) : (
          <>
            <MetricCard
              label="Vốn đọng tồn cao"
              icon="account_balance_wallet"
              value={formatVND(summary.valueLockedOverstock)}
              hint={`${formatNumber(summary.overstockCount)} SKU`}
              tone="error"
            />
            <MetricCard
              label="Vốn đọng chậm luân chuyển"
              icon="hourglass_bottom"
              value={formatVND(summary.valueLockedSlow)}
              hint={`${formatNumber(summary.slowMovingCount)} SKU`}
              tone="warning"
            />
            <MetricCard
              label="Tổng vốn đọng"
              icon="savings"
              value={formatVND(summary.valueLockedOverstock + summary.valueLockedSlow)}
              hint={`Tỷ lệ: ${(
                ((summary.valueLockedOverstock + summary.valueLockedSlow) /
                  summary.totalInventoryValue) *
                100
              ).toFixed(1)}%`}
              tone="primary"
            />
          </>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-thin">
        <button className="px-4 py-2 bg-primary-container text-primary border border-primary-container rounded-full font-label-md text-sm whitespace-nowrap transition-colors">
          Tất cả tồn lâu
        </button>
        <button className="px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-full font-label-md text-sm hover:bg-slate-50 transition-colors whitespace-nowrap">
          Tồn kho &gt; 90 ngày
        </button>
        <button className="px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-full font-label-md text-sm hover:bg-slate-50 transition-colors whitespace-nowrap">
          Clearance
        </button>
      </div>

      {q.isLoading ? (
        <Loader />
      ) : items.length === 0 ? (
        <div className="text-center p-8 text-slate-500 bg-white rounded-2xl border border-slate-200">
          Tất cả stock đều có luân chuyển bình thường.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sorted.slice(0, 30).map((v) => (
            <div
              key={v.vcode}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-6"
            >
              <div className="w-full md:w-20 h-20 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                <MaterialIcon
                  name="inventory_2"
                  className="text-slate-400"
                  size={32}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-2 gap-3">
                  <h3 className="text-lg font-bold text-slate-900 truncate">
                    {v.product || v.vcode}
                  </h3>
                  <StatusBadge tone={toneFor(v.status) as any}>
                    {labelFor(v.status)}
                  </StatusBadge>
                </div>
                <div className="text-xs text-slate-500 font-mono mb-3">
                  {v.vcode}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <span className="bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200">
                    Màu: {v.color || "—"}
                  </span>
                  {v.size && (
                    <span className="bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200">
                      Size: {v.size}
                    </span>
                  )}
                  <span className="bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200">
                    Tồn: {formatNumber(v.stock)} unit
                  </span>
                  <span className="bg-error-container text-error px-3 py-1.5 rounded-lg text-xs font-bold border border-error-container">
                    Giá trị: {formatVND(v.value)}
                  </span>
                </div>
              </div>
              <div className="w-full md:w-auto flex flex-row md:flex-col gap-2 pt-4 md:pt-0 md:pl-6 md:border-l border-slate-100">
                <button className="flex-1 bg-white text-slate-700 px-4 py-2.5 rounded-lg font-label-md text-sm border border-slate-200 hover:bg-slate-50 transition-colors">
                  Giảm giá 20%
                </button>
                <button className="flex-1 bg-primary text-on-primary px-4 py-2.5 rounded-lg font-label-md text-sm hover:opacity-90 transition-colors flex items-center justify-center gap-2 shadow-sm">
                  <MaterialIcon name="sell" size={16} />
                  Clearance
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {items.length > 30 && (
        <div className="mt-6 text-center text-xs text-slate-500">
          Đang hiển thị 30 / {items.length} SKU tồn lâu nhất.
        </div>
      )}
    </>
  );
}
