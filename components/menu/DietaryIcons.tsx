"use client";

import { useI18n } from "@/components/providers/I18nProvider";
import { Icon } from "@/components/ui/Icon";
import type { Allergen, Dietary } from "@/lib/menu";

const DIET_ICON: Record<Dietary, { icon: string; cls: string }> = {
  vegetarian: { icon: "leaf", cls: "text-emerald-700 border-emerald-500/40 bg-emerald-400/10" },
  vegan: { icon: "sprout", cls: "text-lime-700 border-lime-400/30 bg-lime-400/10" },
  spicy: { icon: "chili", cls: "text-red-600 border-red-500/40 bg-red-500/10" },
  glutenFreeOption: { icon: "gfo", cls: "text-sky-700 border-sky-400/30 bg-sky-400/10" },
};

export function dietIcon(d: Dietary) {
  return DIET_ICON[d];
}

export function DietaryBadges({ items, withLabel = false }: { items: Dietary[]; withLabel?: boolean }) {
  const { t } = useI18n();
  if (!items.length) return null;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((d) => (
        <li key={d} title={t.dietary[d]} className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-1 text-[11px] font-semibold ${DIET_ICON[d].cls}`}>
          <Icon name={DIET_ICON[d].icon} className="h-3.5 w-3.5" />
          {withLabel ? <span className="pr-1">{t.dietary[d]}</span> : <span className="sr-only">{t.dietary[d]}</span>}
        </li>
      ))}
    </ul>
  );
}

export function AllergenIcons({ items, withLabel = false }: { items: Allergen[]; withLabel?: boolean }) {
  const { t } = useI18n();
  if (!items.length) return null;
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label={t.menu.allergens}>
      {items.map((a) => (
        <li
          key={a}
          title={t.allergens[a]}
          className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-black/[0.04] px-1.5 py-1 text-[11px] text-cream-muted"
        >
          <Icon name={a} className="h-3.5 w-3.5 text-ember" />
          {withLabel ? <span className="pr-1">{t.allergens[a]}</span> : <span className="sr-only">{t.allergens[a]}</span>}
        </li>
      ))}
    </ul>
  );
}
