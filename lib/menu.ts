import menuData from "@/data/menu.json";
import { tr, type L10n, type Locale } from "./i18n";

export type Allergen =
  | "gluten" | "milk" | "egg" | "mustard" | "sesame" | "soy" | "nuts" | "peanuts" | "celery" | "fish" | "sulphites";
export type Dietary = "vegetarian" | "vegan" | "spicy" | "glutenFreeOption";

export type Category = { id: string; name: L10n; note?: L10n };
export type OptionChoice = { id: string; name: L10n; note?: L10n; price?: number; default?: boolean };
export type OptionGroup = { type: "single" | "multi"; required?: boolean; max?: number; name: L10n; choices: OptionChoice[] };

export type MenuItem = {
  id: string;
  category: string;
  name: L10n;
  description: L10n;
  price: number;
  options?: string[];
  remove?: L10n[];
  dietary: Dietary[];
  allergens: Allergen[];
  image: string;
  signature?: boolean;
  soldOut?: boolean;
  badge?: L10n;
};

export type Menu = {
  currency: string;
  categories: Category[];
  optionGroups: Record<string, OptionGroup>;
  items: MenuItem[];
};

/** Selected choice ids per option group id. */
export type Selections = Record<string, string[]>;

export const menu = menuData as unknown as Menu;

export const DIETARY: Dietary[] = ["vegetarian", "vegan", "spicy", "glutenFreeOption"];

export const REMOVE_GROUP = "remove";
const REMOVE_NAME: L10n = { el: "Αφαίρεση υλικών", en: "Remove ingredients" };

/** All option groups for an item, including its "remove ingredients" list. */
export function itemGroups(item: MenuItem): { id: string; group: OptionGroup }[] {
  const groups = (item.options ?? [])
    .filter((id) => menu.optionGroups[id])
    .map((id) => ({ id, group: menu.optionGroups[id] }));
  if (item.remove?.length) {
    groups.unshift({
      id: REMOVE_GROUP,
      group: { type: "multi", name: REMOVE_NAME, choices: item.remove.map((name, i) => ({ id: String(i), name })) },
    });
  }
  return groups;
}

export function defaultSelections(item: MenuItem): Selections {
  const sel: Selections = {};
  for (const { id, group } of itemGroups(item)) {
    if (group.type !== "single") continue;
    const def = group.choices.find((c) => c.default) ?? (group.required ? group.choices[0] : undefined);
    if (def) sel[id] = [def.id];
  }
  return sel;
}

/** True when a required choice changes the price (shows "from"). */
export function hasVariants(item: MenuItem) {
  return itemGroups(item).some(({ group }) => group.required && group.choices.some((c) => c.price));
}

export function basePrice(item: MenuItem): number {
  return item.price;
}

export function unitPrice(item: MenuItem, sel: Selections): number {
  let total = item.price;
  for (const { id, group } of itemGroups(item)) {
    for (const cid of sel[id] ?? []) total += group.choices.find((c) => c.id === cid)?.price ?? 0;
  }
  return Math.round(total * 100) / 100;
}

/** Human-readable summary of the chosen options, e.g. "Double up · Well done · No onions". */
export function selectionLabel(item: MenuItem, sel: Selections, lang: Locale) {
  const parts: string[] = [];
  for (const { id, group } of itemGroups(item)) {
    for (const cid of sel[id] ?? []) {
      if (cid === "none") continue;
      const c = group.choices.find((x) => x.id === cid);
      if (c) parts.push(tr(c.name, lang));
    }
  }
  return parts.join(" · ");
}

export function getItem(id: string) {
  return menu.items.find((i) => i.id === id);
}

export function formatPrice(value: number, lang: string) {
  return new Intl.NumberFormat(lang === "el" ? "el-CY" : "en-CY", { style: "currency", currency: "EUR" }).format(value);
}
