"use client";

import type { CartLine } from "@/components/providers/CartProvider";

/** Details and recent orders remembered on this device only (localStorage). */
export type SavedCustomer = { name: string; phone: string; email: string; addresses: string[] };
export type RecentOrder = { ref: string; date: string; location: string; mode: string; total: number; lines: Omit<CartLine, "key">[] };

const CUST = "sfr-customer";
const ORDERS = "sfr-orders";

function read<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, v: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {}
}

export const loadCustomer = () => read<SavedCustomer | null>(CUST, null);
export function saveCustomer(c: Omit<SavedCustomer, "addresses">, address?: string) {
  const prev = loadCustomer();
  const addresses = [...new Set([address?.trim(), ...(prev?.addresses ?? [])].filter(Boolean) as string[])].slice(0, 5);
  write(CUST, { ...c, addresses });
}
export const forgetCustomer = () => {
  try {
    localStorage.removeItem(CUST);
  } catch {}
};

export const loadRecentOrders = () => read<RecentOrder[]>(ORDERS, []);
export function saveRecentOrder(o: RecentOrder) {
  write(ORDERS, [o, ...loadRecentOrders().filter((x) => x.ref !== o.ref)].slice(0, 8));
}
