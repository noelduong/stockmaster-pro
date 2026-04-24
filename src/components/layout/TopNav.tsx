import { MaterialIcon } from "@/components/icons/MaterialIcon";
import { DATA_SOURCE, GAS_URL } from "@/lib/config";

interface Props {
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function TopNav({ onRefresh, refreshing }: Props) {
  return (
    <header className="h-16 fixed top-0 right-0 z-40 flex items-center justify-between w-[calc(100%-16rem)] ml-64 px-8 bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant">
      <div className="flex items-center gap-4">
        <h2 className="font-semibold text-base text-primary hidden md:block">
          Inventory Management
        </h2>
        <span
          className={
            "hidden md:inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium " +
            (DATA_SOURCE === "gas"
              ? "bg-success-container text-on-success-container"
              : "bg-warning-container text-on-warning-container")
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

      <div className="flex items-center gap-5">
        <div className="relative hidden md:block w-64">
          <MaterialIcon
            name="search"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant icon-sm"
          />
          <input
            type="text"
            placeholder="Search inventory…"
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-surface-container-low border border-outline-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm text-on-surface placeholder:text-on-surface-variant"
          />
        </div>

        <div className="flex items-center gap-3 text-on-surface-variant">
          <button
            onClick={onRefresh}
            disabled={refreshing}
            title="Refresh data"
            className="hover:text-primary transition-colors disabled:opacity-50"
          >
            <MaterialIcon
              name="refresh"
              className={refreshing ? "animate-spin" : ""}
            />
          </button>
          <button className="hover:text-primary transition-colors">
            <MaterialIcon name="notifications" />
          </button>
          <button className="hover:text-primary transition-colors">
            <MaterialIcon name="history" />
          </button>
          <button className="hover:text-primary transition-colors">
            <MaterialIcon name="account_circle" />
          </button>
        </div>
      </div>
    </header>
  );
}
