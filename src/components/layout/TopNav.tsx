import { MaterialIcon } from "@/components/icons/MaterialIcon";
import { DATA_SOURCE, GAS_URL } from "@/lib/config";

interface Props {
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function TopNav({ onRefresh, refreshing }: Props) {
  return (
    <header className="h-16 fixed top-0 right-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between w-[calc(100%-16rem)] px-8">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-72">
          <MaterialIcon
            name="search"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Tìm kiếm SKU, sản phẩm..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm text-slate-700 placeholder:text-slate-400 transition-shadow"
          />
        </div>
        <span
          className={
            "hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ml-2 " +
            (DATA_SOURCE === "gas"
              ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
              : "bg-amber-50 text-amber-600 border border-amber-200")
          }
          title={DATA_SOURCE === "gas" ? GAS_URL : "Fetching CSV directly"}
        >
          <MaterialIcon
            name={DATA_SOURCE === "gas" ? "cloud_done" : "cloud_download"}
            size={14}
          />
          {DATA_SOURCE === "gas" ? "GAS" : "Direct CSV"}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onRefresh}
          disabled={refreshing}
          title="Làm mới dữ liệu"
          className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-lg transition-all disabled:opacity-50"
        >
          <MaterialIcon
            name="refresh"
            className={refreshing ? "animate-spin" : ""}
            size={20}
          />
        </button>
        <button className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-lg transition-all relative">
          <MaterialIcon name="notifications" size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <button className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-lg transition-all">
          <MaterialIcon name="history" size={20} />
        </button>
        <div className="w-px h-6 bg-slate-200 mx-1"></div>
        <button className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded-lg transition-all">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <MaterialIcon name="person" size={18} className="text-primary" />
          </div>
        </button>
      </div>
    </header>
  );
}
