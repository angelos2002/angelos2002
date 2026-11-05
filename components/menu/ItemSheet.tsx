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
import { defaultSelections, formatPrice, itemGroups, REMOVE_GROUP, unitPrice, type MenuItem, type Selections } from "@/lib/menu";
import { AllergenIcons, DietaryBadges } from "./DietaryIcons";

export function ItemSheet({ item, onClose }: { item: MenuItem | null; onClose: () => void }) {
  const { lang, t } = useI18n();
  const { add } = useCart();
  const [sel, setSel] = useState<Selections>({});
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const imgRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState<MenuItem | null>(item);

  useEffect(() => {
    if (item) {
      setCurrent(item);
      setSel(defaultSelections(item));
      setQty(1);
      setNotes("");
    }
  }, [item]);

  const shown = item ?? current;
  if (!shown) return null;
  const groups = itemGroups(shown);
  const total = unitPrice(shown, sel) * qty;

  const pickSingle = (gid: string, cid: string, required?: boolean) =>
    setSel((s) => ({ ...s, [gid]: !required && s[gid]?.[0] === cid ? [] : [cid] }));
  const toggleMulti = (gid: string, cid: string, max?: number) =>
    setSel((s) => {
      const cur = s[gid] ?? [];
      if (cur.includes(cid)) return { ...s, [gid]: cur.filter((x) => x !== cid) };
      if (max && cur.length >= max) return s;
      return { ...s, [gid]: [...cur, cid] };
    });

  const onAdd = () => {
    const rect = imgRef.current?.getBoundingClientRect();
    const clean = Object.fromEntries(Object.entries(sel).filter(([, v]) => v.length));
    add({ itemId: shown.id, selections: clean, qty, notes: notes.trim() || undefined }, rect ? { rect, image: shown.image } : undefined);
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
      {tr(shown.description, lang) && <p className="text-cream-muted">{tr(shown.description, lang)}</p>}
      {(shown.dietary.length > 0 || shown.allergens.length > 0) && (
        <div className="mt-4 space-y-2">
          <DietaryBadges items={shown.dietary} withLabel />
          <AllergenIcons items={shown.allergens} withLabel />
        </div>
      )}

      {groups.map(({ id: gid, group }) => {
        const chosen = sel[gid] ?? [];
        const single = group.type === "single";
        const isRemove = gid === REMOVE_GROUP;
        const priced = single && group.required && group.choices.some((c) => c.price);
        return (
          <fieldset key={gid} className="mt-7">
            <legend className="mb-3 flex w-full items-baseline justify-between gap-3">
              <span className="heading text-xl">{tr(group.name, lang)}</span>
              <span className="text-xs text-cream-dim">
                {single ? (group.required ? t.menu.chooseOne : t.menu.optional) : group.max ? fmt(t.menu.upTo, { n: group.max }) : t.menu.optional}
              </span>
            </legend>
            {priced ? (
              <div className="grid gap-2 sm:grid-cols-3">
                {group.choices.map((c) => {
                  const active = chosen.includes(c.id);
                  return (
                    <label key={c.id} className={`relative cursor-pointer rounded-2xl border p-3.5 transition ${active ? "border-flame bg-flame/10 shadow-glow-sm" : "border-white/10 bg-white/[0.03] hover:border-white/25"}`}>
                      <input type="radio" name={gid} checked={active} onChange={() => pickSingle(gid, c.id, true)} className="sr-only" />
                      <span className="block pr-6 font-display text-lg font-bold uppercase leading-tight">{tr(c.name, lang)}</span>
                      <span className="mt-1 block text-sm font-semibold tabular-nums text-cream">{formatPrice(shown.price + (c.price ?? 0), lang)}</span>
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
            ) : (
              <div className="flex flex-wrap gap-2">
                {group.choices.map((c) => {
                  const active = chosen.includes(c.id);
                  const disabled = !single && !active && !!group.max && chosen.length >= group.max;
                  return (
                    <label key={c.id} className={`chip cursor-pointer ${active ? (isRemove ? "border-red-400/60 bg-red-500/10 text-cream" : "chip-active") : ""} ${disabled ? "opacity-40" : ""}`}>
                      <input
                        type={single ? "radio" : "checkbox"}
                        name={gid}
                        checked={active}
                        disabled={disabled}
                        onChange={() => (single ? pickSingle(gid, c.id, group.required) : toggleMulti(gid, c.id, group.max))}
                        className="sr-only"
                      />
                      {active && <Icon name={isRemove ? "x" : "check"} className={`h-3.5 w-3.5 ${isRemove ? "text-red-300" : "text-flame"}`} />}
                      {tr(c.name, lang)}
                      {c.price ? <span className="text-xs text-cream-dim">+{formatPrice(c.price, lang)}</span> : null}
                    </label>
                  );
                })}
              </div>
            )}
          </fieldset>
        );
      })}

      <div className="mt-7">
        <label htmlFor="item-notes" className="label">{t.menu.notes}</label>
        <textarea id="item-notes" rows={2} maxLength={200} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t.menu.notesPlaceholder} className="field resize-none" />
      </div>
    </Sheet>
  );
}
