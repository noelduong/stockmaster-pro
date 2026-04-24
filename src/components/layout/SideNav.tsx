import { NavLink } from "react-router-dom";
import { MaterialIcon } from "@/components/icons/MaterialIcon";
import { clsx } from "@/lib/cx";
import { APP_META } from "@/lib/config";

const items = [
  { to: "/", icon: "dashboard", label: "Dashboard" },
  { to: "/inventory", icon: "inventory_2", label: "Tồn kho" },
  { to: "/stock-gaps", icon: "warning", label: "Gãy size" },
  { to: "/overstock", icon: "hourglass_bottom", label: "Tồn lâu" },
  { to: "/intake", icon: "input", label: "Nhập hàng" },
  { to: "/reports", icon: "analytics", label: "Báo cáo" },
];

const footerItems = [
  { to: "/settings", icon: "settings", label: "Cài đặt" },
  { to: "/support", icon: "help", label: "Hỗ trợ" },
];

export function SideNav() {
  return (
    <nav className="h-screen w-64 border-r fixed left-0 top-0 border-slate-200 bg-white flex flex-col py-6 px-4 z-50">
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-on-primary font-bold text-sm shadow-sm">
          S
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-900 leading-none">
            {APP_META.name}
          </h1>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            {APP_META.tagline}
          </p>
        </div>
      </div>

      <ul className="flex-1 space-y-1">
        {items.map((it) => (
          <li key={it.to}>
            <NavLink
              to={it.to}
              end={it.to === "/"}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <MaterialIcon name={it.icon} filled={isActive} size={20} />
                  <span>{it.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="mt-auto space-y-3">
        <button className="w-full py-2.5 px-4 bg-primary text-on-primary rounded-xl font-medium text-sm hover:opacity-90 transition-opacity shadow-sm flex items-center justify-center gap-2">
          <MaterialIcon name="description" size={18} />
          Tạo báo cáo
        </button>
        <ul className="space-y-1 border-t border-slate-100 pt-3">
          {footerItems.map((it) => (
            <li key={it.to}>
              <NavLink
                to={it.to}
                className={({ isActive }) =>
                  clsx(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-slate-400 hover:bg-slate-50 hover:text-slate-700 font-medium",
                  )
                }
              >
                <MaterialIcon name={it.icon} size={20} />
                <span>{it.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
