import { Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import DashboardPage from "@/pages/DashboardPage";
import InventoryPage from "@/pages/InventoryPage";
import StockGapsPage from "@/pages/StockGapsPage";
import OverstockPage from "@/pages/OverstockPage";
import IntakePage from "@/pages/IntakePage";
import ReportsPage from "@/pages/ReportsPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="stock-gaps" element={<StockGapsPage />} />
        <Route path="overstock" element={<OverstockPage />} />
        <Route path="intake" element={<IntakePage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
