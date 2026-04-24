import { PageHeader } from "@/components/ui/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { MetricSkeleton, Loader } from "@/components/ui/Loader";
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
        description="Theo dõi tiến độ nhận hàng và quản lý các đơn hàng nhập (Intake/PO)."
        actions={
          <>
            <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-label-md text-sm hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
              <MaterialIcon name="filter_list" size={18} /> Lọc đơn
            </button>
            <button className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md text-sm hover:opacity-90 transition-opacity shadow-sm flex items-center gap-2">
              <MaterialIcon name="add" size={18} /> Tạo đơn nhập
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {intake.isLoading ? (
          <>
            <MetricSkeleton />
            <MetricSkeleton />
            <MetricSkeleton />
          </>
        ) : (
          <>
            <MetricCard
              label="SKU đã nhập"
              icon="local_shipping"
              value={formatNumber(stats.totalEvents)}
              hint={`Tổng cộng ${formatNumber(stats.totalUnits)} sản phẩm`}
              tone="primary"
            />
            <MetricCard
              label="Nhập trong hôm nay"
              icon="event_available"
              value={formatNumber(stats.todayEvents)}
              hint={`${formatNumber(stats.todayUnits)} sản phẩm nhận hôm nay`}
              tone="success"
            />
            <MetricCard
              label="Giá trị vốn trung bình"
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
              hint="Bình quân gia quyền theo SL nhập"
              tone="default"
            />
          </>
        )}
      </div>

      {/* Filters (Mock) */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-thin">
        <button className="px-4 py-2 bg-primary-container text-primary border border-primary-container rounded-full font-label-md text-sm whitespace-nowrap transition-colors">
          Tất cả SKU nhập
        </button>
        <button className="px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-full font-label-md text-sm hover:bg-slate-50 transition-colors whitespace-nowrap">
          Đang giao
        </button>
        <button className="px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-full font-label-md text-sm hover:bg-slate-50 transition-colors whitespace-nowrap">
          Đã hoàn thành
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-white">
          <h2 className="text-lg font-bold text-slate-900 font-headline-md">
            Lịch sử SKU nhập hàng
          </h2>
          <div className="relative w-64">
             <MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input type="text" placeholder="Tìm kiếm SKU..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow" />
          </div>
        </div>

        {intake.isLoading ? (
          <Loader />
        ) : items.length === 0 ? (
          <div className="text-center p-8 text-slate-500">Chưa có dữ liệu nhập hàng.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="py-4 px-6 font-semibold text-slate-600 text-sm">Variant / Lần nhập cuối</th>
                  <th className="py-4 px-6 font-semibold text-slate-600 text-sm">Sản phẩm</th>
                  <th className="py-4 px-6 font-semibold text-slate-600 text-sm text-right">Tổng SL Nhập</th>
                  <th className="py-4 px-6 font-semibold text-slate-600 text-sm text-right">Tổng Vốn</th>
                  <th className="py-4 px-6 font-semibold text-slate-600 text-sm text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.slice(0, 100).map((it: Variant) => (
                  <tr key={it.vcode + (it.lastInAt || "")} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 text-sm font-mono">{it.vcode}</div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <MaterialIcon name="calendar_today" size={14} />
                        {it.lastInAt ? formatDateTime(it.lastInAt) : "—"}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 text-sm max-w-[200px] truncate">{it.product || "—"}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{it.pcode} · {it.color} {it.size}</div>
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-slate-900">
                      +{formatNumber(it.totalIn)}
                    </td>
                    <td className="py-4 px-6 text-right text-slate-600 font-medium">
                      {formatVND((it.costPrice || 0) * (it.totalIn || 0))}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button className="p-2 text-primary hover:bg-primary-container rounded-lg transition-colors">
                         <MaterialIcon name="visibility" size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
