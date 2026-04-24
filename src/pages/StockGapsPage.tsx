import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { MetricSkeleton, Loader } from "@/components/ui/Loader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { MaterialIcon } from "@/components/icons/MaterialIcon";
import { useInventoryAll } from "@/hooks/useInventoryData";
import { formatNumber, formatVND, relativeDays } from "@/lib/format";
import type { SizeGapGroup, Variant } from "@/types/inventory";

type Tab = "lowstock" | "sizegap" | "outofstock";

export default function StockGapsPage() {
  const [tab, setTab] = useState<Tab>("lowstock");
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
        title="Chi tiết Thiếu hụt tồn kho"
        description="SKU sắp hết, hết hàng và các nhóm gãy size cần hành động."
        actions={
          <button className="px-4 py-2 border border-outline rounded-lg text-on-surface font-medium text-sm hover:bg-surface-container-low flex items-center gap-2">
            <MaterialIcon name="download" size={18} /> Export
          </button>
        }
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
              label="Sắp hết (coverage < 14d)"
              icon="warning"
              value={formatNumber(summary.lowStockCount)}
              hint={`Giá trị cần nhập: ${formatVND(summary.valueAtRiskLowStock)}`}
              tone="error"
              decoration
            />
            <MetricCard
              label="Nhóm gãy size"
              icon="grid_view"
              value={formatNumber(summary.sizeGapGroupCount)}
              hint={`Trên tổng ${formatNumber(summary.totalProducts)} sản phẩm`}
              tone="warning"
            />
            <MetricCard
              label="Hết hàng hoàn toàn"
              icon="block"
              value={formatNumber(summary.outOfStockCount)}
              hint="SKU có tồn = 0"
              tone="default"
            />
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-md border-b border-outline-variant/30">
        <TabButton
          active={tab === "lowstock"}
          onClick={() => setTab("lowstock")}
        >
          Sắp hết ({lowStock.length})
        </TabButton>
        <TabButton active={tab === "sizegap"} onClick={() => setTab("sizegap")}>
          Gãy size ({sizeGaps.length})
        </TabButton>
        <TabButton
          active={tab === "outofstock"}
          onClick={() => setTab("outofstock")}
        >
          Hết hàng ({outOfStock.length})
        </TabButton>
      </div>

      {tab === "lowstock" && (
        <LowStockTable loading={q.isLoading} items={lowStock} />
      )}
      {tab === "sizegap" && (
        <SizeGapList loading={q.isLoading} groups={sizeGaps} />
      )}
      {tab === "outofstock" && (
        <OutOfStockTable loading={q.isLoading} items={outOfStock} />
      )}
    </>
  );
}

function TabButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors " +
        (active
          ? "border-primary text-primary"
          : "border-transparent text-on-surface-variant hover:text-on-surface")
      }
    >
      {children}
    </button>
  );
}

function LowStockTable({
  loading,
  items,
}: {
  loading: boolean;
  items: Variant[];
}) {
  if (loading) return <Loader />;
  if (items.length === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40">
        <EmptyState
          icon="check_circle"
          title="Không có SKU sắp hết"
          description="Mọi variant đều có coverage đủ an toàn."
        />
      </div>
    );
  }
  const sorted = [...items].sort(
    (a, b) => (a.coverageDays ?? 0) - (b.coverageDays ?? 0),
  );
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-container-low text-xs text-on-surface-variant uppercase">
            <tr>
              <th className="p-md font-medium">Sản phẩm</th>
              <th className="p-md font-medium">Variant</th>
              <th className="p-md font-medium text-right">Tồn</th>
              <th className="p-md font-medium text-right">Avg/ngày</th>
              <th className="p-md font-medium text-right">Coverage</th>
              <th className="p-md font-medium text-right">Giá trị</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {sorted.slice(0, 200).map((v) => (
              <tr
                key={v.vcode}
                className="hover:bg-surface-container-low transition-colors"
              >
                <td className="p-md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-surface-container flex items-center justify-center shrink-0">
                      <MaterialIcon
                        name="inventory_2"
                        className="text-on-surface-variant"
                        size={20}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-on-surface truncate max-w-[240px]">
                        {v.product || "—"}
                      </div>
                      <div className="text-xs text-on-surface-variant font-mono">
                        {v.pcode}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-md">
                  <div className="text-on-surface">
                    {v.color}
                    {v.size && ` · ${v.size}`}
                  </div>
                  <div className="text-xs text-on-surface-variant font-mono">
                    {v.vcode}
                  </div>
                </td>
                <td className="p-md text-right font-semibold text-on-surface">
                  {formatNumber(v.stock)}
                </td>
                <td className="p-md text-right text-on-surface-variant">
                  {v.avgDailySales.toFixed(2)}
                </td>
                <td className="p-md text-right">
                  <StatusBadge tone="critical">
                    {v.coverageDays !== null
                      ? `${v.coverageDays.toFixed(1)}d`
                      : "—"}
                  </StatusBadge>
                </td>
                <td className="p-md text-right text-on-surface">
                  {formatVND(v.value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {items.length > 200 && (
        <div className="p-sm border-t border-outline-variant/30 text-center text-xs text-on-surface-variant bg-surface-container-low">
          Hiển thị 200/{items.length} SKU
        </div>
      )}
    </div>
  );
}

function OutOfStockTable({
  loading,
  items,
}: {
  loading: boolean;
  items: Variant[];
}) {
  if (loading) return <Loader />;
  if (items.length === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40">
        <EmptyState
          icon="check_circle"
          title="Không có SKU hết hàng"
          description="Tất cả variant đều còn tồn."
        />
      </div>
    );
  }
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-container-low text-xs text-on-surface-variant uppercase">
            <tr>
              <th className="p-md font-medium">Sản phẩm</th>
              <th className="p-md font-medium">Variant</th>
              <th className="p-md font-medium text-right">Đã bán (window)</th>
              <th className="p-md font-medium text-right">Lần xuất cuối</th>
              <th className="p-md font-medium text-center">Gãy size?</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {items.slice(0, 200).map((v) => (
              <tr
                key={v.vcode}
                className="hover:bg-surface-container-low transition-colors"
              >
                <td className="p-md">
                  <div className="font-medium text-on-surface truncate max-w-[240px]">
                    {v.product || "—"}
                  </div>
                  <div className="text-xs text-on-surface-variant font-mono">
                    {v.pcode}
                  </div>
                </td>
                <td className="p-md">
                  <div className="text-on-surface">
                    {v.color}
                    {v.size && ` · ${v.size}`}
                  </div>
                  <div className="text-xs text-on-surface-variant font-mono">
                    {v.vcode}
                  </div>
                </td>
                <td className="p-md text-right text-on-surface-variant">
                  {formatNumber(v.totalOutWindow)}
                </td>
                <td className="p-md text-right text-on-surface-variant">
                  {relativeDays(v.lastOutAt)}
                </td>
                <td className="p-md text-center">
                  {v.inSizeGap ? (
                    <StatusBadge tone="warning" icon="straighten">
                      Có
                    </StatusBadge>
                  ) : (
                    <span className="text-xs text-on-surface-variant">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {items.length > 200 && (
        <div className="p-sm border-t border-outline-variant/30 text-center text-xs text-on-surface-variant bg-surface-container-low">
          Hiển thị 200/{items.length}
        </div>
      )}
    </div>
  );
}

function SizeGapList({
  loading,
  groups,
}: {
  loading: boolean;
  groups: SizeGapGroup[];
}) {
  if (loading) return <Loader />;
  if (groups.length === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40">
        <EmptyState
          icon="check_circle"
          title="Không có gãy size"
          description="Mọi nhóm sản phẩm đều có đủ size đang bán."
        />
      </div>
    );
  }
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-container-low text-xs text-on-surface-variant uppercase">
            <tr>
              <th className="p-md font-medium">Sản phẩm</th>
              <th className="p-md font-medium">Màu</th>
              <th className="p-md font-medium">Size có / hết</th>
              <th className="p-md font-medium text-right">% thiếu</th>
              <th className="p-md font-medium text-right">Tổng tồn</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {groups.slice(0, 200).map((g) => (
              <tr
                key={g.key}
                className="hover:bg-surface-container-low transition-colors"
              >
                <td className="p-md">
                  <div className="font-medium text-on-surface truncate max-w-[280px]">
                    {g.product || "—"}
                  </div>
                  <div className="text-xs text-on-surface-variant font-mono">
                    {g.pcode}
                  </div>
                </td>
                <td className="p-md text-on-surface">{g.color || "—"}</td>
                <td className="p-md">
                  <div className="flex flex-wrap gap-1">
                    {g.inStockSizes.map((s) => (
                      <span
                        key={"in-" + s}
                        className="px-2 py-0.5 rounded bg-success-container text-on-success-container text-xs font-medium"
                        title="Còn hàng"
                      >
                        {s}
                      </span>
                    ))}
                    {g.outOfStockSizes.map((s) => (
                      <span
                        key={"out-" + s}
                        className="px-2 py-0.5 rounded bg-error-container text-on-error-container text-xs font-semibold"
                        title="Hết hàng"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-md text-right font-medium text-error">
                  {(g.missingRatio * 100).toFixed(0)}%
                </td>
                <td className="p-md text-right text-on-surface-variant">
                  {formatNumber(g.totalStock)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
