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
        description="Tổng quan sức khỏe tồn kho toàn shop."
        actions={
          <Link
            to="/stock-gaps"
            className="bg-primary-container text-on-primary-container px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-primary hover:text-on-primary transition-colors"
          >
            <MaterialIcon name="bolt" size={18} />
            Xem Stock Gaps
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-gutter mb-xl">
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

      {/* Secondary row: size-gap groups + no-sales */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-xl">
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-gutter">
        {/* Low stock */}
        <div className="xl:col-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant/40 overflow-hidden">
          <div className="p-md border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low">
            <div>
              <h2 className="text-lg font-semibold text-on-surface">
                Sắp hết hàng (coverage ngắn nhất)
              </h2>
              <p className="text-xs text-on-surface-variant">
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
            <div className="p-md text-sm text-on-surface-variant">
              Đang tải…
            </div>
          ) : lowStockTop.length === 0 ? (
            <div className="p-lg text-sm text-on-surface-variant text-center">
              Không có SKU sắp hết 🎉
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-on-surface-variant uppercase bg-surface">
                <tr>
                  <th className="p-md font-medium">Variant</th>
                  <th className="p-md font-medium">Sản phẩm</th>
                  <th className="p-md font-medium text-right">Tồn</th>
                  <th className="p-md font-medium text-right">Coverage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {lowStockTop.map((v) => (
                  <tr
                    key={v.vcode}
                    className="hover:bg-surface-container-low transition-colors"
                  >
                    <td className="p-md font-mono text-xs text-on-surface">
                      {v.vcode}
                    </td>
                    <td className="p-md">
                      <div className="font-medium text-on-surface truncate max-w-[220px]">
                        {v.product || "—"}
                      </div>
                      <div className="text-xs text-on-surface-variant">
                        {v.color}
                        {v.size && ` · ${v.size}`}
                      </div>
                    </td>
                    <td className="p-md text-right font-medium">
                      {formatNumber(v.stock)}
                    </td>
                    <td className="p-md text-right">
                      <StatusBadge tone="critical">
                        {v.coverageDays !== null
                          ? `${v.coverageDays.toFixed(1)}d`
                          : "—"}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent Intake */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 overflow-hidden">
          <div className="p-md border-b border-outline-variant/30 bg-surface-container-low">
            <h2 className="text-lg font-semibold text-on-surface">
              Nhập hàng gần đây
            </h2>
            <p className="text-xs text-on-surface-variant">
              5 giao dịch nhập kho mới nhất
            </p>
          </div>
          {q.isLoading ? (
            <div className="p-md text-sm text-on-surface-variant">
              Đang tải…
            </div>
          ) : recentIntake.length === 0 ? (
            <div className="p-lg text-sm text-on-surface-variant text-center">
              Chưa có giao dịch nhập gần đây
            </div>
          ) : (
            <ul className="divide-y divide-outline-variant/20">
              {recentIntake.map((it) => (
                <li key={it.vcode + (it.lastInAt || "")} className="p-md">
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <div className="font-medium text-sm text-on-surface truncate">
                        {it.product || it.vcode}
                      </div>
                      <div className="text-xs text-on-surface-variant font-mono mt-0.5">
                        {it.vcode}
                      </div>
                    </div>
                    <StatusBadge tone="success" icon="arrow_downward">
                      +{formatNumber(it.totalInWindow || it.totalIn)}
                    </StatusBadge>
                  </div>
                  <div className="text-xs text-on-surface-variant mt-1">
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
