import type { DataSourceMode } from "@/types/inventory";

const env = import.meta.env;

export const GAS_URL = (env.VITE_GAS_URL || "").trim();

export const SHEET_ID = (
  env.VITE_SHEET_ID || "1lBTzufSZSW5BuRqBYtB8Cbl7J1lhb9quV-KOaT2lhHc"
).trim();

/** Snapshot tab (hierarchical inventory list) */
export const SNAPSHOT_GID = (env.VITE_SNAPSHOT_GID || "2125225444").trim();

/** Transaction log tab */
export const LOG_GID = (env.VITE_LOG_GID || "490379386").trim();

export const VELOCITY_DAYS = Number(env.VITE_VELOCITY_DAYS || 28);

export const DATA_SOURCE: DataSourceMode = GAS_URL ? "gas" : "csv";

export const CSV_SNAPSHOT_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SNAPSHOT_GID}`;
export const CSV_LOG_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${LOG_GID}`;

export const APP_META = {
  name: "StockMaster Pro",
  tagline: "Inventory Control",
};
