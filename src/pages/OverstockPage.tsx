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
        description="Overstock & slow-moving inventory cần clearance action."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-xl">
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
              decoration
            />
            <MetricCard
              label="Vốn đọng chậm luân chuyển"
              icon="hourglass_bottom"
              value={formatVND(summary.valueLockedSlow)}
              hint={`${formatNumber(summary.slowMovingCount)} SKU`}
              tone="warning"
            />
            <MetricCard
              label="Tổng tồn kho"
              icon="savings"
              value={formatVND(summary.totalInventoryValue)}
              hint={`Tỷ lệ đọng: ${(
                ((summary.valueLockedOverstock + summary.valueLockedSlow) /
                  summary.totalInventoryValue) *
                100
              ).toFixed(1)}%`}
              tone="primary"
            />
          </>
        )}
      </div>

      {q.isLoading ? (
        <Loader />
      ) : items.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-lg">
          <EmptyState
            icon="inventory_2"
            title="Không có tồn kho lâu"
            description="Tất cả stock đều có luân chuyển bình thường."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-gutter">
          {sorted.slice(0, 30).map((v) => (
            <div
              key={v.vcode}
              className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant/50 flex flex-col md:flex-row items-start md:items-center gap-lg"
            >
              <div className="w-full md:w-20 h-20 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
                <MaterialIcon
                  name="inventory_2"
                  className="text-on-surface-variant"
                  size={28}
                />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2 gap-3">
                  <h3 className="text-lg font-semibold text-on-surface truncate">
                    {v.product || v.vcode}
                  </h3>
                  <StatusBadge tone={toneFor(v.status) as any}>
                    {labelFor(v.status)}
                  </StatusBadge>
                </div>
                <div className="text-xs text-on-surface-variant font-mono mb-3">
                  {v.vcode}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <span className="bg-surface-container-high text-on-surface px-3 py-1 rounded-full text-xs font-medium border border-outline-variant/30">
                    Màu: {v.color || "—"}
                  </span>
                  {v.size && (
                    <span className="bg-surface-container-high text-on-surface px-3 py-1 rounded-full text-xs font-medium border border-outline-variant/30">
                      Size: {v.size}
                    </span>
                  )}
                  <span className="bg-surface-container-high text-on-surface px-3 py-1 rounded-full text-xs font-medium border border-outline-variant/30">
                    Tồn: {formatNumber(v.stock)} unit
                  </span>
                  <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-xs font-medium">
                    Giá trị: {formatVND(v.value)}
                  </span>
                </div>
              </div>
              <div className="w-full md:w-auto flex md:flex-col gap-2 border-t md:border-t-0 md:border-l border-outline-variant/30 pt-4 md:pt-0 md:pl-lg">
                <button className="flex-1 bg-surface-container text-on-surface px-4 py-2 rounded-lg font-medium text-sm border border-outline-variant hover:bg-surface-variant transition-colors">
                  Giảm giá 20%
                </button>
                <button className="flex-1 bg-primary text-on-primary px-4 py-2 rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors flex items-center gap-2 justify-center">
                  <MaterialIcon name="sell" size={16} />
                  Clearance
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {items.length > 30 && (
        <div className="mt-lg text-center text-xs text-on-surface-variant p-md bg-surface-container-low rounded-xl border border-outline-variant/30">
          Hiển thị 30/{items.length} SKU tồn lâu. Sắp xếp theo ngày nhập đầu
          tiên.
        </div>
      )}
    </>
  );
}
