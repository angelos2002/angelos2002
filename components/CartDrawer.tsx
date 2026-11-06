"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/components/providers/I18nProvider";
import { linePrice, useCart } from "@/components/providers/CartProvider";
import { formatPrice, getItem, selectionLabel } from "@/lib/menu";
import { tr } from "@/lib/i18n";
import { AnimatedPrice } from "./ui/AnimatedPrice";
import { Icon } from "./ui/Icon";
import { Sheet } from "./ui/Sheet";

export function lineLabel(itemId: string, selections: Record<string, string[]>, lang: "el" | "en") {
  const item = getItem(itemId);
  return item ? selectionLabel(item, selections, lang) : "";
}

export function CartLines({ compact = false }: { compact?: boolean }) {
  const { lang, t } = useI18n();
  const { lines, setQty } = useCart();
  return (
    <ul className="space-y-3">
      {lines.map((l) => {
        const item = getItem(l.itemId)!;
        return (
          <li key={l.key} className="flex gap-3 rounded-2xl border border-black/5 bg-black/[0.03] p-3">
            {!compact && (
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-ink-600">
                <Image src={item.image} alt="" fill sizes="64px" className="object-cover" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold leading-tight">{tr(item.name, lang)}</p>
                <p className="shrink-0 text-sm font-semibold tabular-nums text-cream">{formatPrice(linePrice(l), lang)}</p>
              </div>
              {lineLabel(l.itemId, l.selections, lang) && <p className="mt-0.5 text-xs text-cream-dim">{lineLabel(l.itemId, l.selections, lang)}</p>}
              {l.notes && <p className="mt-0.5 text-xs italic text-cream-dim">“{l.notes}”</p>}
              <div className="mt-2 flex items-center gap-2">
                <button type="button" onClick={() => setQty(l.key, l.qty - 1)} className="grid h-8 w-8 place-items-center rounded-full border border-black/10 hover:border-flame" aria-label={t.menu.decrease}>
                  <Icon name={l.qty === 1 ? "x" : "minus"} className="h-4 w-4" />
                </button>
                <span className="w-6 text-center text-sm tabular-nums">{l.qty}</span>
                <button type="button" onClick={() => setQty(l.key, l.qty + 1)} className="grid h-8 w-8 place-items-center rounded-full border border-black/10 hover:border-flame" aria-label={t.menu.increase}>
                  <Icon name="plus" className="h-4 w-4" />
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function CartDrawer() {
  const { lang, t } = useI18n();
  const { open, setOpen, lines, subtotal } = useCart();
  return (
    <Sheet
      open={open}
      onClose={() => setOpen(false)}
      title={t.menu.bag}
      side="right"
      closeLabel={t.common.close}
      footer={
        lines.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-cream-muted">{t.checkout.subtotal}</span>
              <AnimatedPrice value={subtotal} lang={lang} className="font-display text-2xl font-bold" />
            </div>
            <Link href={`/${lang}/checkout`} onClick={() => setOpen(false)} className="btn-primary w-full">
              {t.menu.checkout} <Icon name="arrowRight" />
            </Link>
          </div>
        ) : null
      }
    >
      {lines.length === 0 ? (
        <div className="py-10 text-center text-cream-muted">
          <Icon name="bag" className="mx-auto mb-3 h-10 w-10 text-flame/60" />
          <p>{t.menu.emptyBag}</p>
          <Link href={`/${lang}/menu`} onClick={() => setOpen(false)} className="btn-ghost mt-6">
            {t.common.viewMenu}
          </Link>
        </div>
      ) : (
        <CartLines />
      )}
    </Sheet>
  );
}
