import data from "@/data/promos.json";
import type { OrderMode } from "./locations";

type Promo = {
  code: string;
  type: "percent" | "fixed";
  value: number;
  minSubtotal?: number;
  active: boolean;
  modes?: OrderMode[];
  locations?: string[];
  expires?: string;
};

const promos = (data.codes as Promo[]) ?? [];

export type PromoResult =
  | { ok: true; code: string; discount: number; label: string }
  | { ok: false; reason: "invalid" | "min" | "mode" | "expired"; minSubtotal?: number };

export function applyPromo(code: string, subtotal: number, mode: OrderMode, location: string): PromoResult {
  const p = promos.find((x) => x.active && x.code.toLowerCase() === code.trim().toLowerCase());
  if (!p) return { ok: false, reason: "invalid" };
  if (p.expires && new Date().toISOString().slice(0, 10) > p.expires) return { ok: false, reason: "expired" };
  if ((p.modes && !p.modes.includes(mode)) || (p.locations && !p.locations.includes(location))) return { ok: false, reason: "mode" };
  if (p.minSubtotal && subtotal < p.minSubtotal) return { ok: false, reason: "min", minSubtotal: p.minSubtotal };
  const raw = p.type === "percent" ? (subtotal * p.value) / 100 : p.value;
  const discount = Math.round(Math.min(raw, subtotal) * 100) / 100;
  return { ok: true, code: p.code.toUpperCase(), discount, label: p.type === "percent" ? `-${p.value}%` : `-€${p.value}` };
}
