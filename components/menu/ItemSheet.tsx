"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/providers/CartProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import { AnimatedPrice } from "@/components/ui/AnimatedPrice";
import { Icon } from "@/components/ui/Icon";
import { Photo } from "@/components/ui/Photo";
import { Sheet } from "@/components/ui/Sheet";
import { fmt, tr } from "@/lib/i18n";
import { formatPrice, hasSauces, menu, sizeChoices, unitPrice, type MenuItem } from "@/lib/menu";
import { AllergenIcons, DietaryBadges } from "./DietaryIcons";

export function ItemSheet({ item, onClose }: { item: MenuItem | null; onClose: () => void }) {
  const { lang, t } = useI18n();
  const { add } = useCart();
  const sizes = item ? sizeChoices(item) : [];
  const sauceGroup = menu.optionGroups.sauces;
  const maxSauces = sauceGroup?.max ?? 3;
  const [size, setSize] = useState<string | undefined>();
  const [sauces, setSauces] = useState<string[]>([]);
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const imgRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState<MenuItem | null>(item);

  useEffect(() => {
    if (item) {
      setCurrent(item);
      setSize(sizeChoices(item)[0]?.id);
      setSauces([]);
      setQty(1);
      setNotes("");
    }
  }, [item]);

  const shown = item ?? current;
  if (!shown) return null;
  const unit = unitPrice(shown, size, sauces);
  const total = unit * qty;

  const toggleSauce = (id: string) =>
    setSauces((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length >= maxSauces ? s : [...s, id]));

  const onAdd = () => {
    const rect = imgRef.current?.getBoundingClientRect();
    add(
      { itemId: shown.id, size, sauces, qty, notes: notes.trim() || undefined },
      rect ? { rect, image: shown.image } : undefined,
    );
    onClose();
  };

  return (
    <Sheet
      open={!!item}
      onClose={onClose}
      title={tr(shown.name, lang)}
      closeLabel={t.common.close}
      footer={
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-full border border-white/10">
            <button type="button" className="grid h-12 w-11 place-items-center disabled:opacity-40" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label={t.menu.decrease}>
              <Icon name="minus" className="h-4 w-4" />
            </button>
            <span className="w-6 text-center font-semibold tabular-nums" aria-label={t.menu.quantity}>{qty}</span>
            <button type="button" className="grid h-12 w-11 place-items-center" onClick={() => setQty((q) => Math.min(20, q + 1))} aria-label={t.menu.increase}>
              <Icon name="plus" className="h-4 w-4" />
            </button>
          </div>
          <button type="button" onClick={onAdd} className="btn-primary flex-1 justify-between px-5">
            <span>{t.menu.addToBag}</span>
            <AnimatedPrice value={total} lang={lang} />
          </button>
        </div>
      }
    >
      <div ref={imgRef} className="-mx-5 -mt-5 mb-5">
        <Photo src={shown.image} alt={tr(shown.name, lang)} className="aspect-[16/9] w-full" sizes="560px" />
      </div>
      <p className="text-cream-muted">{tr(shown.description, lang)}</p>
      <div className="mt-4 space-y-2">
        <DietaryBadges items={shown.dietary} withLabel />
        <AllergenIcons items={shown.allergens} withLabel />
      </div>

      {sizes.length > 0 && (
        <fieldset className="mt-7">
          <legend className="heading mb-3 text-xl">{t.menu.size}</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {sizes.map((c) => {
              const active = size === c.id;
              return (
                <label
                  key={c.id}
                  className={`relative cursor-pointer rounded-2xl border p-3.5 transition ${active ? "border-flame bg-flame/10 shadow-glow-sm" : "border-white/10 bg-white/[0.03] hover:border-white/25"}`}
                >
                  <input type="radio" name="size" value={c.id} checked={active} onChange={() => setSize(c.id)} className="sr-only" />
                  <span className="flex items-center justify-between gap-2 sm:block">
                    <span>
                      <span className="block font-display text-xl font-bold uppercase">{tr(c.name, lang)}</span>
                      {c.note && <span className="block text-xs text-cream-dim">{tr(c.note, lang)}</span>}
                    </span>
                    <span className="mt-1 block font-semibold tabular-nums text-cream">{formatPrice(shown.prices![c.id], lang)}</span>
                  </span>
                  <AnimatePresence>
                    {active && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute right-2.5 top-2.5 grid h-5 w-5 place-items-center rounded-full bg-flame text-ink">
                        <Icon name="check" className="h-3.5 w-3.5" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      {hasSauces(shown) && sauceGroup && (
        <fieldset className="mt-7">
          <legend className="mb-3 flex w-full items-baseline justify-between">
            <span className="heading text-xl">{t.menu.sauces}</span>
            <span className="text-xs text-cream-dim">{fmt(t.menu.upTo, { n: maxSauces })}</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {sauceGroup.choices.map((c) => {
              const active = sauces.includes(c.id);
              const disabled = !active && sauces.length >= maxSauces;
              return (
                <label key={c.id} className={`chip cursor-pointer ${active ? "chip-active" : ""} ${disabled ? "opacity-40" : ""}`}>
                  <input type="checkbox" checked={active} disabled={disabled} onChange={() => toggleSauce(c.id)} className="sr-only" />
                  {active && <Icon name="check" className="h-3.5 w-3.5 text-flame" />}
                  {tr(c.name, lang)}
                  <span className="text-xs text-cream-dim">{c.price ? `+${formatPrice(c.price, lang)}` : t.menu.free}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className="mt-7">
        <label htmlFor="item-notes" className="label">{t.menu.notes}</label>
        <textarea id="item-notes" rows={2} maxLength={200} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t.menu.notesPlaceholder} className="field resize-none" />
      </div>
    </Sheet>
  );
}
