import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Reports"
        description="Historical analytics and custom reports."
      />
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40">
        <EmptyState
          icon="analytics"
          title="Reports coming soon"
          description="Trend charts, vendor reports, and export tools will be available here."
        />
      </div>
    </>
  );
}
