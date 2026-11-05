"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/components/providers/CartProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import { Icon } from "@/components/ui/Icon";
import { loadRecentOrders, type RecentOrder } from "@/lib/customer";
import { tr } from "@/lib/i18n";
import { formatPrice, getItem } from "@/lib/menu";

/** "Order again" shortcuts from orders placed on this device. */
export function RecentOrders() {
  const { lang, t } = useI18n();
  const { add, setOpen } = useCart();
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  useEffect(() => setOrders(loadRecentOrders().slice(0, 3)), []);
  if (!orders.length) return null;
  const locale = lang === "el" ? "el-CY" : "en-GB";

  const reorder = (o: RecentOrder) => {
    for (const l of o.lines) {
      const item = getItem(l.itemId);
      if (item && !item.soldOut) add(l);
    }
    setOpen(true);
  };

  return (
    <section className="mb-10" aria-labelledby="recent-h">
      <h2 id="recent-h" className="kicker mb-3">{t.menu.recentOrders}</h2>
      <ul className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
        {orders.map((o) => {
          const names = o.lines.map((l) => getItem(l.itemId)).filter(Boolean).map((i) => tr(i!.name, lang));
          return (
            <li key={o.ref} className="glass flex w-72 shrink-0 flex-col p-4">
              <p className="text-xs text-cream-dim">
                {new Date(o.date).toLocaleDateString(locale, { day: "numeric", month: "short" })} · {o.ref}
              </p>
              <p className="mt-1 line-clamp-2 text-sm">{names.join(", ")}</p>
              <div className="mt-auto flex items-center justify-between pt-3">
                <span className="text-sm font-semibold tabular-nums">{formatPrice(o.total, lang)}</span>
                <button type="button" onClick={() => reorder(o)} className="btn-ghost px-4 py-1.5 text-sm">
                  <Icon name="bag" className="h-4 w-4" /> {t.menu.orderAgain}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
