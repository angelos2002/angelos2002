import "server-only";
import { getSupabase } from "./supabase";
import { locations, ORDER_MODES, type OrderMode, type Overrides, type StoreOverride } from "./locations";

const g = globalThis as unknown as { __sfrStatus?: Overrides };

export async function getOverrides(): Promise<Overrides> {
  const sb = getSupabase();
  if (!sb) return { ...(g.__sfrStatus ?? {}) };
  const { data } = await sb.from("store_status").select("id, mode, paused");
  const out: Overrides = {};
  for (const r of data ?? []) out[r.id] = { mode: r.mode, paused: r.paused ?? [] };
  return out;
}

export function sanitizeOverride(input: unknown): StoreOverride | null {
  if (!input || typeof input !== "object") return null;
  const { mode, paused } = input as Record<string, unknown>;
  if (mode !== "auto" && mode !== "open" && mode !== "closed") return null;
  const p = Array.isArray(paused) ? paused.filter((m): m is OrderMode => ORDER_MODES.includes(m as OrderMode)) : [];
  return { mode, paused: p };
}

export async function setOverride(id: string, o: StoreOverride) {
  if (!locations.some((l) => l.id === id)) throw new Error("unknown store");
  const sb = getSupabase();
  if (!sb) {
    g.__sfrStatus = { ...(g.__sfrStatus ?? {}), [id]: o };
    return;
  }
  const { error } = await sb.from("store_status").upsert({ id, mode: o.mode, paused: o.paused ?? [], updated_at: new Date().toISOString() });
  if (error) throw error;
}
