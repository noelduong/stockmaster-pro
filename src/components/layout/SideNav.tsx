import { NavLink } from "react-router-dom";
import { MaterialIcon } from "@/components/icons/MaterialIcon";
import { clsx } from "@/lib/cx";
import { APP_META } from "@/lib/config";

const items = [
  { to: "/", icon: "dashboard", label: "Dashboard" },
  { to: "/inventory", icon: "inventory_2", label: "Inventory" },
  { to: "/stock-gaps", icon: "warning", label: "Stock Gaps" },
  { to: "/overstock", icon: "hourglass_bottom", label: "Overstock" },
  { to: "/intake", icon: "input", label: "Intake Plans" },
  { to: "/reports", icon: "analytics", label: "Reports" },
];

const footerItems = [
  { to: "/settings", icon: "settings", label: "Settings" },
  { to: "/support", icon: "help", label: "Support" },
];

export function SideNav() {
  return (
    <nav className="h-screen w-64 border-r fixed left-0 top-0 bg-surface-container-lowest border-outline-variant flex flex-col py-6 px-4 z-50">
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container">
          <MaterialIcon name="inventory_2" filled />
        </div>
        <div>
          <h1 className="text-base font-semibold text-on-surface leading-tight">
            {APP_META.name}
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            {APP_META.tagline}
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-1">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.to === "/"}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors duration-200",
                isActive
                  ? "bg-primary-container text-on-primary-container border-r-4 border-primary font-semibold"
                  : "text-on-surface-variant hover:bg-surface-container",
              )
            }
          >
            {({ isActive }) => (
              <>
                <MaterialIcon name={it.icon} filled={isActive} />
                <span>{it.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      <div className="mt-auto pt-4 border-t border-outline-variant flex flex-col gap-1">
        {footerItems.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors",
                isActive
                  ? "bg-primary-container text-on-primary-container"
                  : "text-on-surface-variant hover:bg-surface-container",
              )
            }
          >
            <MaterialIcon name={it.icon} />
            <span>{it.label}</span>
          </NavLink>
        ))}
        <button className="mt-3 w-full bg-primary-container text-on-primary-container py-2 rounded-lg font-medium text-sm hover:bg-primary hover:text-on-primary transition-colors">
          Generate Report
        </button>
      </div>
    </nav>
  );
}
