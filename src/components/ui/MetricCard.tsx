import type { ReactNode } from "react";
import { MaterialIcon } from "@/components/icons/MaterialIcon";
import { clsx } from "@/lib/cx";

type Tone = "default" | "error" | "warning" | "success" | "primary";

interface Props {
  label: string;
  icon: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: Tone;
  decoration?: boolean;
  children?: ReactNode;
}

const toneStyles: Record<
  Tone,
  { iconBg: string; iconText: string; border: string; blob: string }
> = {
  default: {
    iconBg: "bg-surface-container",
    iconText: "text-on-surface-variant",
    border: "border-slate-200",
    blob: "bg-surface-container-high",
  },
  error: {
    iconBg: "bg-error-container",
    iconText: "text-error",
    border: "border-slate-200",
    blob: "bg-error-container/40",
  },
  warning: {
    iconBg: "bg-warning-container",
    iconText: "text-[#7a4500]",
    border: "border-slate-200",
    blob: "bg-warning-container/50",
  },
  success: {
    iconBg: "bg-success-container",
    iconText: "text-success",
    border: "border-slate-200",
    blob: "bg-success-container/40",
  },
  primary: {
    iconBg: "bg-primary-container",
    iconText: "text-primary",
    border: "border-slate-200",
    blob: "bg-primary-container/40",
  },
};

export function MetricCard({
  label,
  icon,
  value,
  hint,
  tone = "default",
  decoration = false,
  children,
}: Props) {
  const t = toneStyles[tone];
  return (
    <div
      className={clsx(
        "bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between relative overflow-hidden",
        t.border,
      )}
    >
      {decoration && (
        <div
          className={clsx(
            "absolute -right-6 -top-6 w-28 h-28 rounded-full blur-2xl pointer-events-none",
            t.blob,
          )}
        />
      )}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <h3 className="text-sm font-semibold text-slate-500 font-label-md uppercase tracking-wider">
          {label}
        </h3>
        <div className={clsx("p-2 rounded-lg flex items-center justify-center", t.iconBg, t.iconText)}>
          <MaterialIcon name={icon} filled />
        </div>
      </div>
      <div className="relative z-10">
        <div className="text-3xl font-bold text-slate-900 tracking-tight">
          {value}
        </div>
        {hint && (
          <div className="mt-2 text-sm text-slate-500 font-medium">
            {hint}
          </div>
        )}
      </div>
      {children && <div className="mt-4 relative z-10">{children}</div>}
    </div>
  );
}
