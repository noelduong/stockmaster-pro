import type { ReactNode } from "react";
import { MaterialIcon } from "@/components/icons/MaterialIcon";
import { clsx } from "@/lib/cx";

export type StatusTone =
  | "critical"
  | "warning"
  | "success"
  | "neutral"
  | "primary";

interface Props {
  tone?: StatusTone;
  icon?: string;
  children: ReactNode;
  className?: string;
}

const tones: Record<StatusTone, string> = {
  critical: "bg-error-container text-on-error-container",
  warning: "bg-warning-container text-[#7a4500]",
  success: "bg-success-container text-on-success-container",
  primary: "bg-primary-container text-on-primary-container",
  neutral: "bg-surface-variant text-on-surface-variant",
};

export function StatusBadge({
  tone = "neutral",
  icon,
  children,
  className,
}: Props) {
  return (
    <span
      className={clsx(
        "px-2 py-1 rounded-md text-xs font-semibold inline-flex items-center w-max gap-1",
        tones[tone],
        className,
      )}
    >
      {icon && <MaterialIcon name={icon} size={14} />}
      {children}
    </span>
  );
}
