import { GAS_URL, VELOCITY_DAYS } from "./config";
import {
  buildProducts,
  buildSummary,
  detectSizeGaps,
  enrichVariants,
} from "./analytics";
import type {
  ApiEnvelope,
  InventoryAll,
  SnapshotPayload,
  Thresholds,
  VelocityPayload,
} from "@/types/inventory";
import { DEFAULT_THRESHOLDS } from "@/types/inventory";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { method: "GET", redirect: "follow" });
  if (!res.ok) throw new Error(`GAS request failed: ${res.status}`);
  return res.json();
}

function requireGas(): string {
  if (!GAS_URL) {
    throw new Error(
      "VITE_GAS_URL is not configured. Add it to .env.local and restart the dev server.",
    );
  }
  return GAS_URL;
}

function withParams(
  base: string,
  params: Record<string, string | number | boolean | undefined>,
): string {
  const u = new URL(base);
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    u.searchParams.set(k, String(v));
  }
  return u.toString();
}

export async function getSnapshot(refresh = false): Promise<SnapshotPayload> {
  const url = withParams(requireGas(), {
    route: "snapshot",
    refresh: refresh ? 1 : undefined,
  });
  const env = await fetchJson<ApiEnvelope<SnapshotPayload>>(url);
  return env.data;
}

export async function getVelocity(
  days: number = VELOCITY_DAYS,
  refresh = false,
): Promise<VelocityPayload> {
  const url = withParams(requireGas(), {
    route: "velocity",
    days,
    refresh: refresh ? 1 : undefined,
  });
  const env = await fetchJson<ApiEnvelope<VelocityPayload>>(url);
  return env.data;
}

export async function getAll(
  days: number = VELOCITY_DAYS,
  refresh = false,
  thresholds: Thresholds = DEFAULT_THRESHOLDS,
): Promise<InventoryAll> {
  const url = withParams(requireGas(), {
    route: "all",
    days,
    refresh: refresh ? 1 : undefined,
  });
  const env =
    await fetchJson<
      ApiEnvelope<{ snapshot: SnapshotPayload; velocity: VelocityPayload }>
    >(url);
  const { snapshot, velocity } = env.data;
  const variants = enrichVariants(snapshot, velocity, thresholds);
  const sizeGaps = detectSizeGaps(variants);
  const products = buildProducts(variants);
  const summary = buildSummary(variants, sizeGaps, products, snapshot.asOf);
  return {
    snapshot,
    velocity,
    variants,
    products,
    sizeGaps,
    summary,
    asOf: snapshot.asOf,
  };
}
