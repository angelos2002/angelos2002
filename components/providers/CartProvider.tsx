"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getItem, unitPrice, type Selections } from "@/lib/menu";

export type CartLine = {
  key: string;
  itemId: string;
  selections: Selections;
  qty: number;
  notes?: string;
};

type Flight = { id: number; from: DOMRect; to: DOMRect; image: string };

type CartCtx = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (line: Omit<CartLine, "key">, origin?: { rect: DOMRect; image: string }) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  registerTarget: (el: HTMLElement | null) => void;
  bump: number;
  hydrated: boolean;
};

const Ctx = createContext<CartCtx | null>(null);
const STORAGE_KEY = "sfr-cart-v2";

export function lineKey(l: Omit<CartLine, "key" | "qty">) {
  const sel = Object.keys(l.selections)
    .sort()
    .map((k) => `${k}=${[...l.selections[k]].sort().join("+")}`)
    .join(";");
  return [l.itemId, sel, (l.notes ?? "").trim()].join("|");
}

export function linePrice(l: CartLine) {
  const item = getItem(l.itemId);
  return item ? unitPrice(item, l.selections) * l.qty : 0;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [open, setOpen] = useState(false);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [bump, setBump] = useState(0);
  const targets = useRef(new Set<HTMLElement>());
  const reduce = useReducedMotion();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartLine[];
        setLines(parsed.filter((l) => getItem(l.itemId) && l.selections));
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {}
  }, [lines, hydrated]);

  const registerTarget = useCallback((el: HTMLElement | null) => {
    if (el) targets.current.add(el);
  }, []);

  const visibleTarget = () => {
    // Prefer the most recently registered visible target (page-level cart over header bag).
    for (const el of [...targets.current].reverse()) {
      if (!el.isConnected) {
        targets.current.delete(el);
        continue;
      }
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight) return r;
    }
    return null;
  };

  const add: CartCtx["add"] = (line, origin) => {
    const key = lineKey(line);
    setLines((prev) => {
      const existing = prev.find((l) => l.key === key);
      if (existing) return prev.map((l) => (l.key === key ? { ...l, qty: l.qty + line.qty } : l));
      return [...prev, { ...line, key }];
    });
    const to = origin && !reduce ? visibleTarget() : null;
    if (origin && to) {
      const id = Date.now() + Math.random();
      setFlights((f) => [...f, { id, from: origin.rect, to, image: origin.image }]);
      window.setTimeout(() => {
        setFlights((f) => f.filter((x) => x.id !== id));
        setBump((b) => b + 1);
      }, 750);
    } else {
      setBump((b) => b + 1);
    }
  };

  const setQty = (key: string, qty: number) =>
    setLines((prev) => (qty <= 0 ? prev.filter((l) => l.key !== key) : prev.map((l) => (l.key === key ? { ...l, qty } : l))));

  const value = useMemo<CartCtx>(() => {
    const count = lines.reduce((s, l) => s + l.qty, 0);
    const subtotal = Math.round(lines.reduce((s, l) => s + linePrice(l), 0) * 100) / 100;
    return { lines, count, subtotal, add, setQty, clear: () => setLines([]), open, setOpen, registerTarget, bump, hydrated };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines, open, bump, hydrated]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]">
        <AnimatePresence>
          {flights.map((f) => {
            const size = 72;
            const sx = f.from.left + f.from.width / 2 - size / 2;
            const sy = f.from.top + f.from.height / 2 - size / 2;
            const ex = f.to.left + f.to.width / 2 - size / 2;
            const ey = f.to.top + f.to.height / 2 - size / 2;
            return (
              <motion.div
                key={f.id}
                className="absolute left-0 top-0 h-[72px] w-[72px] overflow-hidden rounded-full border-2 border-flame shadow-glow"
                initial={{ x: sx, y: sy, scale: 1, opacity: 1 }}
                animate={{ x: [sx, (sx + ex) / 2, ex], y: [sy, Math.min(sy, ey) - 120, ey], scale: [1, 0.8, 0.25], opacity: [1, 1, 0.6] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.75, ease: [0.5, 0, 0.3, 1], times: [0, 0.45, 1] }}
                style={{ backgroundImage: `url(${f.image})`, backgroundSize: "cover", backgroundPosition: "center", backgroundColor: "#00e1ec" }}
              />
            );
          })}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}

export function useCart() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCart outside CartProvider");
  return v;
}
