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
    border: "border-outline-variant/50",
    blob: "bg-surface-container-high",
  },
  error: {
    iconBg: "bg-error-container",
    iconText: "text-error",
    border: "border-error-container/50",
    blob: "bg-error-container/40",
  },
  warning: {
    iconBg: "bg-warning-container",
    iconText: "text-[#7a4500]",
    border: "border-warning-container/60",
    blob: "bg-warning-container/50",
  },
  success: {
    iconBg: "bg-success-container",
    iconText: "text-success",
    border: "border-success-container/60",
    blob: "bg-success-container/40",
  },
  primary: {
    iconBg: "bg-primary-container",
    iconText: "text-on-primary-container",
    border: "border-primary-container",
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
        "bg-surface-container-lowest rounded-xl p-5 border shadow-card flex flex-col justify-between relative overflow-hidden min-h-[140px]",
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
      <div className="flex items-center justify-between mb-3 relative">
        <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">
          {label}
        </span>
        <div
          className={clsx(
            "w-9 h-9 rounded-lg flex items-center justify-center",
            t.iconBg,
            t.iconText,
          )}
        >
          <MaterialIcon name={icon} filled />
        </div>
      </div>
      <div className="relative">
        <div className="text-3xl font-semibold text-on-surface tracking-tight">
          {value}
        </div>
        {hint && (
          <div className="text-sm text-on-surface-variant mt-1">{hint}</div>
        )}
      </div>
      {children && <div className="mt-3 relative">{children}</div>}
    </div>
  );
}
