import { useQuery } from "@tanstack/react-query";
import { getAll } from "@/lib/api";
import { VELOCITY_DAYS } from "@/lib/config";
import { useMemo } from "react";
import type { Variant, VariantStatus } from "@/types/inventory";

export const INVENTORY_QUERY_KEY = ["inventory-all"] as const;

export function useInventoryAll(refresh = false) {
  return useQuery({
    queryKey: [...INVENTORY_QUERY_KEY, refresh],
    queryFn: () => getAll(VELOCITY_DAYS, refresh),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useVariantsByStatus(status: VariantStatus | VariantStatus[]) {
  const { data, ...rest } = useInventoryAll();
  const filter = useMemo(() => {
    const set = new Set(Array.isArray(status) ? status : [status]);
    return (v: Variant) => set.has(v.status);
  }, [status]);
  const variants = useMemo(
    () => (data?.variants || []).filter(filter),
    [data?.variants, filter],
  );
  return { ...rest, data, variants };
}
