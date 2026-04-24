import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { MetricSkeleton, Loader } from "@/components/ui/Loader";
import { MaterialIcon } from "@/components/icons/MaterialIcon";
import { useInventoryAll } from "@/hooks/useInventoryData";
import { formatNumber, formatVND, relativeDays } from "@/lib/format";
import type { SizeGapGroup, Variant } from "@/types/inventory";

type Tab = "lowstock" | "sizegap" | "outofstock";

export default function StockGapsPage() {
  const [tab, setTab] = useState<Tab>("sizegap");
  const q = useInventoryAll();
  const data = q.data;

  const lowStock: Variant[] = (data?.variants || []).filter(
    (v) => v.status === "low",
  );
  const outOfStock: Variant[] = (data?.variants || []).filter(
    (v) => v.status === "out",
  );
  const sizeGaps: SizeGapGroup[] = data?.sizeGaps || [];

  const summary = data?.summary;

  return (
    <>
      <PageHeader
        title="Chi tiết Gãy size"
        description="Phân tích các mã hàng thiếu size đang bán chạy."
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
              label="Tỷ lệ gãy size (Group)"
              icon="pie_chart"
              value={summary.sizeGapGroupCount > 0 && summary.totalProducts > 0 ? `${((summary.sizeGapGroupCount / summary.totalProducts) * 100).toFixed(1)}%` : "0%"}
              hint={`Tổng số nhóm gãy size: ${formatNumber(summary.sizeGapGroupCount)}`}
              tone="primary"
            />
            <MetricCard
              label="Giá trị nhập sắp hết"
              icon="trending_down"
              value={formatVND(summary.valueAtRiskLowStock)}
              hint={`Dựa trên ${formatNumber(summary.lowStockCount)} SKU sắp hết`}
              tone="error"
            />
            <MetricCard
              label="Mã hoàn toàn hết hàng"
              icon="straighten"
              value={formatNumber(summary.outOfStockCount)}
              hint="SKU có tồn = 0 cần lưu ý"
              tone="warning"
            />
          </>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-thin">
        <button className="px-4 py-2 bg-primary-container text-primary border border-primary-container rounded-full font-label-md text-sm whitespace-nowrap transition-colors">
          Tất cả gãy size
        </button>
        <button className="px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-full font-label-md text-sm hover:bg-slate-50 transition-colors whitespace-nowrap">
          Gãy size cơ bản (S,M,L)
        </button>
        <button className="px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-full font-label-md text-sm hover:bg-slate-50 transition-colors whitespace-nowrap">
          Gãy size ngoại cỡ (XL,XXL)
        </button>
      </div>

      <div className="flex gap-6 border-b border-slate-200 mb-6">
        <TabButton active={tab === "sizegap"} onClick={() => setTab("sizegap")}>
          Gãy size ({sizeGaps.length})
        </TabButton>
        <TabButton active={tab === "lowstock"} onClick={() => setTab("lowstock")}>
          Sắp hết ({lowStock.length})
        </TabButton>
        <TabButton active={tab === "outofstock"} onClick={() => setTab("outofstock")}>
          Hết hàng ({outOfStock.length})
        </TabButton>
      </div>

      {tab === "sizegap" && <SizeGapList loading={q.isLoading} groups={sizeGaps} />}
      {tab === "lowstock" && <LowStockTable loading={q.isLoading} items={lowStock} />}
      {tab === "outofstock" && <OutOfStockTable loading={q.isLoading} items={outOfStock} />}
    </>
  );
}

function TabButton({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={
        "pb-3 text-sm font-label-md transition-colors border-b-2 " +
        (active ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-900")
      }
    >
      {children}
    </button>
  );
}

function SizeGapList({ loading, groups }: { loading: boolean; groups: SizeGapGroup[] }) {
  if (loading) return <Loader />;
  if (groups.length === 0) return <div className="text-center p-8 text-slate-500">Không có dữ liệu gãy size.</div>;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200">
              <th className="py-4 px-6 font-semibold text-slate-600 text-sm">Sản phẩm</th>
              <th className="py-4 px-6 font-semibold text-slate-600 text-sm">Màu sắc</th>
              <th className="py-4 px-6 font-semibold text-slate-600 text-sm">Tình trạng size</th>
              <th className="py-4 px-6 font-semibold text-slate-600 text-sm text-right">Tổng tồn</th>
              <th className="py-4 px-6 font-semibold text-slate-600 text-sm text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {groups.slice(0, 100).map((g) => (
              <tr key={g.key} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                      <MaterialIcon name="inventory_2" className="text-slate-400" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 font-label-md max-w-[200px] truncate">{g.product || "—"}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{g.pcode}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-slate-700 text-sm font-medium">{g.color || "—"}</td>
                <td className="py-4 px-6">
                  <div className="flex flex-wrap gap-1.5">
                    {g.inStockSizes.map((s) => (
                      <span key={"in-" + s} className="px-2 py-1 bg-surface-container text-slate-600 rounded-md text-xs font-semibold border border-slate-200">
                        {s}
                      </span>
                    ))}
                    {g.outOfStockSizes.map((s) => (
                      <span key={"out-" + s} className="px-2 py-1 bg-error-container text-error rounded-md text-xs font-bold border border-error-container">
                        {s}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-4 px-6 text-right text-slate-900 font-semibold">{formatNumber(g.totalStock)}</td>
                <td className="py-4 px-6 text-center">
                  <button className="p-2 text-primary hover:bg-primary-container rounded-lg transition-colors">
                    <MaterialIcon name="chevron_right" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LowStockTable({ loading, items }: { loading: boolean; items: Variant[] }) {
  if (loading) return <Loader />;
  if (items.length === 0) return <div className="text-center p-8 text-slate-500">Không có dữ liệu sắp hết hàng.</div>;
  
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200">
              <th className="py-4 px-6 font-semibold text-slate-600 text-sm">Sản phẩm</th>
              <th className="py-4 px-6 font-semibold text-slate-600 text-sm text-right">Tồn</th>
              <th className="py-4 px-6 font-semibold text-slate-600 text-sm text-right">Coverage</th>
              <th className="py-4 px-6 font-semibold text-slate-600 text-sm text-right">Giá trị</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.slice(0, 100).map((v) => (
              <tr key={v.vcode} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-4 px-6">
                  <div className="font-bold text-slate-900 text-sm">{v.product || "—"}</div>
                  <div className="text-xs text-slate-500">{v.vcode} · {v.color} {v.size}</div>
                </td>
                <td className="py-4 px-6 text-right font-semibold">{formatNumber(v.stock)}</td>
                <td className="py-4 px-6 text-right text-error font-medium">{v.coverageDays?.toFixed(1)}d</td>
                <td className="py-4 px-6 text-right">{formatVND(v.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OutOfStockTable({ loading, items }: { loading: boolean; items: Variant[] }) {
  if (loading) return <Loader />;
  if (items.length === 0) return <div className="text-center p-8 text-slate-500">Không có dữ liệu hết hàng.</div>;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200">
              <th className="py-4 px-6 font-semibold text-slate-600 text-sm">Sản phẩm</th>
              <th className="py-4 px-6 font-semibold text-slate-600 text-sm text-right">Đã bán (window)</th>
              <th className="py-4 px-6 font-semibold text-slate-600 text-sm text-right">Lần xuất cuối</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.slice(0, 100).map((v) => (
              <tr key={v.vcode} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-4 px-6">
                  <div className="font-bold text-slate-900 text-sm">{v.product || "—"}</div>
                  <div className="text-xs text-slate-500">{v.vcode} · {v.color} {v.size}</div>
                </td>
                <td className="py-4 px-6 text-right font-medium">{formatNumber(v.totalOutWindow)}</td>
                <td className="py-4 px-6 text-right text-slate-500">{relativeDays(v.lastOutAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
