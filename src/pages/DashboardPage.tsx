import { PageHeader } from "@/components/ui/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { MetricSkeleton } from "@/components/ui/Loader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MaterialIcon } from "@/components/icons/MaterialIcon";
import { useInventoryAll } from "@/hooks/useInventoryData";
import { formatNumber, formatVND, relativeDays } from "@/lib/format";
import { Link } from "react-router-dom";
import type { Variant } from "@/types/inventory";

export default function DashboardPage() {
  const q = useInventoryAll();
  const data = q.data;
  const summary = data?.summary;

  const lowStockTop: Variant[] = (data?.variants || [])
    .filter((v) => v.status === "low")
    .sort((a, b) => (a.coverageDays ?? 0) - (b.coverageDays ?? 0))
    .slice(0, 5);

  const recentIntake: Variant[] = (data?.variants || [])
    .filter((v) => !!v.lastInAt)
    .sort((a, b) => Date.parse(b.lastInAt || "") - Date.parse(a.lastInAt || ""))
    .slice(0, 5);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Tổng quan sức khỏe tồn kho toàn hệ thống."
        actions={
          <Link
            to="/stock-gaps"
            className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md text-sm flex items-center gap-2 hover:opacity-90 transition-opacity shadow-sm"
          >
            <MaterialIcon name="bolt" size={18} />
            Xem Stock Gaps
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        {q.isLoading ? (
          <>
            <MetricSkeleton />
            <MetricSkeleton />
            <MetricSkeleton />
            <MetricSkeleton />
          </>
        ) : summary ? (
          <>
            <MetricCard
              label="Tổng giá trị tồn"
              icon="account_balance_wallet"
              value={formatVND(summary.totalInventoryValue)}
              hint={`${formatNumber(summary.totalVariants)} SKU · ${formatNumber(summary.totalProducts)} SP`}
              tone="primary"
            />
            <MetricCard
              label="Sắp hết hàng"
              icon="warning"
              value={formatNumber(summary.lowStockCount)}
              hint={`Giá trị cần nhập: ${formatVND(summary.valueAtRiskLowStock)}`}
              tone="error"
              decoration
            />
            <MetricCard
              label="Chậm luân chuyển"
              icon="hourglass_bottom"
              value={formatNumber(summary.slowMovingCount)}
              hint={`Vốn đọng: ${formatVND(summary.valueLockedSlow)}`}
              tone="warning"
            />
            <MetricCard
              label="Tồn cao"
              icon="inventory"
              value={formatNumber(summary.overstockCount)}
              hint={`Vốn đọng: ${formatVND(summary.valueLockedOverstock)}`}
              tone="default"
            />
          </>
        ) : (
          <div className="col-span-full text-sm text-error">
            Lỗi tải dữ liệu. {String(q.error)}
          </div>
        )}
      </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <MetricCard
            label="Nhóm gãy size"
            icon="grid_view"
            value={formatNumber(summary.sizeGapGroupCount)}
            hint="Cặp sản phẩm-màu thiếu size"
            tone="warning"
          />
          <MetricCard
            label="Hết hàng"
            icon="block"
            value={formatNumber(summary.outOfStockCount)}
            hint="Variant có tồn = 0"
            tone="error"
          />
          <MetricCard
            label="Chưa phát sinh bán"
            icon="help"
            value={formatNumber(summary.noSalesCount)}
            hint="Tồn có nhưng chưa có giao dịch xuất"
            tone="default"
          />
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Low stock */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-white">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-headline-md">
                Sắp hết hàng (coverage ngắn nhất)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Top 5 SKU cần cân nhắc nhập bổ sung
              </p>
            </div>
            <Link
              to="/stock-gaps"
              className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
            >
              Xem tất cả
              <MaterialIcon name="arrow_forward" size={16} />
            </Link>
          </div>
          {q.isLoading ? (
            <div className="p-6 text-sm text-slate-500">Đang tải…</div>
          ) : lowStockTop.length === 0 ? (
            <div className="p-8 text-sm text-slate-500 text-center">
              Không có SKU sắp hết 🎉
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-50/50 border-b border-slate-200 text-xs text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="py-4 px-6 font-semibold">Variant</th>
                    <th className="py-4 px-6 font-semibold">Sản phẩm</th>
                    <th className="py-4 px-6 font-semibold text-right">Tồn</th>
                    <th className="py-4 px-6 font-semibold text-right">Coverage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lowStockTop.map((v) => (
                    <tr key={v.vcode} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-mono text-xs font-bold text-slate-900">
                        {v.vcode}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 text-sm truncate max-w-[220px]">
                          {v.product || "—"}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {v.color}
                          {v.size && ` · ${v.size}`}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-slate-900">
                        {formatNumber(v.stock)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <StatusBadge tone="critical">
                          {v.coverageDays !== null ? `${v.coverageDays.toFixed(1)}d` : "—"}
                        </StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Intake */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-200 bg-white">
            <h2 className="text-lg font-bold text-slate-900 font-headline-md">
              Nhập hàng gần đây
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              5 giao dịch nhập kho mới nhất
            </p>
          </div>
          {q.isLoading ? (
            <div className="p-6 text-sm text-slate-500">Đang tải…</div>
          ) : recentIntake.length === 0 ? (
            <div className="p-8 text-sm text-slate-500 text-center flex-1 flex items-center justify-center">
              Chưa có giao dịch nhập gần đây
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 flex-1">
              {recentIntake.map((it) => (
                <li key={it.vcode + (it.lastInAt || "")} className="p-6 hover:bg-slate-50/50 transition-colors">
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-slate-900 truncate">
                        {it.product || it.vcode}
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-1">
                        {it.vcode}
                      </div>
                    </div>
                    <StatusBadge tone="success" icon="arrow_downward">
                      +{formatNumber(it.totalInWindow || it.totalIn)}
                    </StatusBadge>
                  </div>
                  <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                    <MaterialIcon name="schedule" size={14} />
                    {relativeDays(it.lastInAt)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
