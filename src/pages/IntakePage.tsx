import { PageHeader } from "@/components/ui/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { MetricSkeleton, Loader } from "@/components/ui/Loader";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MaterialIcon } from "@/components/icons/MaterialIcon";
import { useIntake } from "@/hooks/useInventoryData";
import {
  formatNumber,
  formatVND,
  formatDateTime,
  relativeDays,
} from "@/lib/format";
import { useMemo } from "react";
import type { Variant } from "@/types/inventory";

export default function IntakePage() {
  const intake = useIntake();
  const items: Variant[] = intake.data || [];

  const stats = useMemo(() => {
    const totalUnits = items.reduce((s: number, it: Variant) => s + (it.totalIn || 0), 0);
    const today = new Date().toDateString();
    const todayItems = items.filter(
      (it: Variant) => it.lastInAt && new Date(it.lastInAt).toDateString() === today,
    );
    const todayUnits = todayItems.reduce((s: number, it: Variant) => s + (it.totalIn || 0), 0);
    return {
      totalEvents: items.length,
      totalUnits,
      todayEvents: todayItems.length,
      todayUnits,
    };
  }, [items]);

  return (
    <>
      <PageHeader
        title="Quản lý Nhập hàng"
        description="Track incoming inventory and intake events."
        actions={
          <button className="bg-primary-container text-on-primary-container px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-primary hover:text-on-primary transition-colors">
            <MaterialIcon name="add" size={18} /> New Intake
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-xl">
        {intake.isLoading ? (
          <>
            <MetricSkeleton />
            <MetricSkeleton />
            <MetricSkeleton />
          </>
        ) : (
          <>
            <MetricCard
              label="Total Intake Events"
              icon="local_shipping"
              value={formatNumber(stats.totalEvents)}
              hint={`${formatNumber(stats.totalUnits)} units total`}
              tone="primary"
            />
            <MetricCard
              label="Intake Today"
              icon="event_available"
              value={formatNumber(stats.todayEvents)}
              hint={`${formatNumber(stats.todayUnits)} units received`}
              tone="success"
            />
            <MetricCard
              label="Avg Cost/Unit"
              icon="payments"
              value={
                stats.totalUnits > 0
                  ? formatVND(
                      items.reduce(
                        (s: number, it: Variant) => s + (it.costPrice || 0) * (it.totalIn || 0),
                        0,
                      ) / stats.totalUnits,
                    )
                  : "—"
              }
              hint="Weighted by intake qty"
              tone="default"
            />
          </>
        )}
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 overflow-hidden">
        <div className="p-md border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low">
          <h2 className="text-lg font-semibold text-on-surface">
            Recent Intake Events
          </h2>
          <div className="flex gap-2">
            <button className="p-2 text-on-surface-variant hover:bg-surface-variant rounded-lg transition-colors">
              <MaterialIcon name="filter_list" size={18} />
            </button>
          </div>
        </div>

        {intake.isLoading ? (
          <Loader />
        ) : items.length === 0 ? (
          <EmptyState
            icon="inbox"
            title="No intake events yet"
            description="Intake events will show up here once recorded in the sheet."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-xs text-on-surface-variant uppercase">
                <tr>
                  <th className="p-md font-medium">Variant</th>
                  <th className="p-md font-medium">Product</th>
                  <th className="p-md font-medium">Last In</th>
                  <th className="p-md font-medium text-right">Units In</th>
                  <th className="p-md font-medium text-right">Cost Value</th>
                  <th className="p-md font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {items.slice(0, 200).map((it: Variant) => {
                  const days =
                    it.lastInAt === null
                      ? 999
                      : Math.floor(
                          (Date.now() - new Date(it.lastInAt).getTime()) /
                            (1000 * 60 * 60 * 24),
                        );
                  const tone =
                    days <= 1 ? "success" : days <= 7 ? "primary" : "neutral";
                  return (
                    <tr
                      key={it.vcode + (it.lastInAt || "")}
                      className="hover:bg-surface-container-low transition-colors"
                    >
                      <td className="p-md">
                        <div className="font-mono text-xs text-on-surface">
                          {it.vcode}
                        </div>
                        <div className="text-xs text-on-surface-variant mt-0.5">
                          {it.color}
                          {it.size && ` · ${it.size}`}
                        </div>
                      </td>
                      <td className="p-md">
                        <div className="font-medium text-on-surface truncate max-w-[240px]">
                          {it.product || "—"}
                        </div>
                        <div className="text-xs text-on-surface-variant">
                          {it.pcode}
                        </div>
                      </td>
                      <td className="p-md">
                        <div className="text-sm text-on-surface">
                          {formatDateTime(it.lastInAt)}
                        </div>
                        <div className="text-xs text-on-surface-variant">
                          {relativeDays(it.lastInAt)}
                        </div>
                      </td>
                      <td className="p-md text-right font-medium text-on-surface">
                        +{formatNumber(it.totalIn)}
                      </td>
                      <td className="p-md text-right text-on-surface-variant">
                        {formatVND((it.costPrice || 0) * (it.totalIn || 0))}
                      </td>
                      <td className="p-md text-center">
                        <StatusBadge tone={tone} icon="check_circle">
                          {days === 0
                            ? "Today"
                            : days === 1
                              ? "Yesterday"
                              : days < 999
                                ? `${days}d ago`
                                : "—"}
                        </StatusBadge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {items.length > 200 && (
          <div className="p-sm border-t border-outline-variant/30 text-center text-xs text-on-surface-variant bg-surface-container-low">
            Showing first 200 of {items.length} intake events
          </div>
        )}
      </div>
    </>
  );
}
