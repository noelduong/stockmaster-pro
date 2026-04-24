import { create } from "zustand";
import type { DataSourceMode } from "@/types/inventory";
import { DATA_SOURCE, GAS_URL } from "@/lib/config";

interface InventoryStoreState {
  mode: DataSourceMode;
  apiUrl: string;
  searchQuery: string;
  sidebarCollapsed: boolean;
  setMode: (mode: DataSourceMode) => void;
  setApiUrl: (url: string) => void;
  setSearchQuery: (q: string) => void;
  toggleSidebar: () => void;
}

export const useInventoryStore = create<InventoryStoreState>((set) => ({
  mode: DATA_SOURCE,
  apiUrl: GAS_URL,
  searchQuery: "",
  sidebarCollapsed: false,
  setMode: (mode: DataSourceMode) => set({ mode }),
  setApiUrl: (apiUrl: string) => set({ apiUrl }),
  setSearchQuery: (searchQuery: string) => set({ searchQuery }),
  toggleSidebar: () =>
    set((s: InventoryStoreState) => ({
      sidebarCollapsed: !s.sidebarCollapsed,
    })),
}));
