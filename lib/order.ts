import { getItem, itemGroups, unitPrice, type Selections } from "./menu";
import { activeModes, getLocation, getOpenStatus, scheduleSlots, type OrderMode, type StoreOverride } from "./locations";
import { applyPromo } from "./promos";
import { DELIVERY_FEE } from "./site";

export type OrderLineInput = { itemId: string; selections: Selections; qty: number; notes?: string };

export type OrderInput = {
  mode: OrderMode;
  location: string;
  when: "asap" | string; // ISO time for scheduled orders
  lines: OrderLineInput[];
  promo?: string;
  tip?: number;
};

export type PricedOrder = {
  lines: (OrderLineInput & { name: string; unit: number; total: number })[];
  subtotal: number;
  discount: number;
  promo?: string;
  fee: number;
  tip: number;
  total: number;
};

const r2 = (n: number) => Math.round(n * 100) / 100;

/** Validate and price an order on the server. Returns an error code or the priced order. */
export function priceOrder(input: OrderInput, override?: StoreOverride, now = new Date()): { error: string } | PricedOrder {
  const loc = getLocation(input.location);
  if (!loc) return { error: "location" };
  if (!activeModes(loc, override).includes(input.mode)) return { error: "mode" };
  if (!Array.isArray(input.lines) || input.lines.length === 0 || input.lines.length > 50) return { error: "empty" };

  const status = getOpenStatus(loc, now, override);
  if (input.when === "asap") {
    if (status.state !== "open") return { error: "closed" };
  } else {
    if (override?.mode === "closed") return { error: "closed" };
    const t = Date.parse(input.when);
    const ok = Number.isFinite(t) && scheduleSlots(loc, now, 8, 15, 20).some((s) => Math.abs(Date.parse(s.iso) - t) < 60000);
    if (!ok) return { error: "time" };
  }

  const lines: PricedOrder["lines"] = [];
  for (const l of input.lines) {
    const item = getItem(l.itemId);
    const qty = Math.floor(Number(l.qty));
    if (!item || item.soldOut || !(qty >= 1 && qty <= 20)) return { error: "item" };
    // keep only valid groups / choices
    const clean: Selections = {};
    for (const { id, group } of itemGroups(item)) {
      const chosen = (l.selections?.[id] ?? []).filter((c) => group.choices.some((x) => x.id === c));
      if (group.type === "single" && chosen.length > 1) return { error: "item" };
      if (group.max && chosen.length > group.max) return { error: "item" };
      if (group.required && group.type === "single" && chosen.length === 0) return { error: "item" };
      if (chosen.length) clean[id] = chosen;
    }
    const unit = unitPrice(item, clean);
    lines.push({ itemId: item.id, selections: clean, qty, notes: String(l.notes ?? "").slice(0, 200) || undefined, name: item.name.en, unit, total: r2(unit * qty) });
  }

  const subtotal = r2(lines.reduce((s, l) => s + l.total, 0));
  let discount = 0;
  let promo: string | undefined;
  if (input.promo) {
    const p = applyPromo(input.promo, subtotal, input.mode, loc.id);
    if (!p.ok) return { error: "promo" };
    discount = p.discount;
    promo = p.code;
  }
  const fee = input.mode === "delivery" ? DELIVERY_FEE : 0;
  const tip = r2(Math.max(0, Math.min(Number(input.tip) || 0, 100)));
  return { lines, subtotal, discount, promo, fee, tip, total: r2(subtotal - discount + fee + tip) };
}
