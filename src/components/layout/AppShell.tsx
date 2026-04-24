import { Outlet, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { SideNav } from "./SideNav";
import { TopNav } from "./TopNav";
import { useState } from "react";
import { getAll } from "@/lib/api";
import { VELOCITY_DAYS } from "@/lib/config";
import { INVENTORY_QUERY_KEY } from "@/hooks/useInventoryData";

export function AppShell() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  useNavigate(); // keep react-router warm

  async function handleRefresh() {
    setRefreshing(true);
    try {
      // force bypass of GAS cache
      const fresh = await getAll(VELOCITY_DAYS, true);
      queryClient.setQueryData([...INVENTORY_QUERY_KEY, false], fresh);
      await queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEY });
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  }

  return (
    <div className="min-h-screen bg-background text-on-background flex">
      <SideNav />
      <TopNav onRefresh={handleRefresh} refreshing={refreshing} />
      <main className="ml-64 mt-16 p-lg w-full min-h-[calc(100vh-4rem)] bg-surface">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
