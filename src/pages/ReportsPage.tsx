import { PageHeader } from "@/components/ui/PageHeader";
import { MaterialIcon } from "@/components/icons/MaterialIcon";

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Báo cáo & Phân tích"
        description="Báo cáo xu hướng, phân tích theo nhóm hàng và xuất dữ liệu."
      />
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col items-center justify-center text-center py-20 px-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-5">
            <MaterialIcon name="analytics" size={36} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            Báo cáo đang phát triển
          </h3>
          <p className="text-sm text-slate-500 max-w-md">
            Biểu đồ xu hướng, báo cáo nhà cung cấp và công cụ xuất dữ liệu sẽ
            sớm có mặt tại đây.
          </p>
        </div>
      </div>
    </>
  );
}
