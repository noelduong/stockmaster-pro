import { MaterialIcon } from "@/components/icons/MaterialIcon";

export function Loader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-on-surface-variant">
      <MaterialIcon name="progress_activity" className="animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-surface-container-high rounded ${className}`}
    />
  );
}

export function MetricSkeleton() {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/50 shadow-card min-h-[140px] space-y-3">
      <div className="flex justify-between items-center">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}
