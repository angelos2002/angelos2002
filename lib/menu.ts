import menuData from "@/data/menu.json";
import type { L10n } from "./i18n";

export type Allergen =
  | "gluten" | "milk" | "egg" | "mustard" | "sesame" | "soy" | "nuts" | "peanuts" | "celery" | "fish" | "sulphites";
export type Dietary = "vegetarian" | "vegan" | "spicy" | "glutenFreeOption";

export type Category = { id: string; name: L10n };
export type OptionChoice = { id: string; name: L10n; note?: L10n; price?: number };
export type OptionGroup = { type: "single" | "multi"; max?: number; name: L10n; choices: OptionChoice[] };

export type MenuItem = {
  id: string;
  category: string;
  name: L10n;
  description: L10n;
  price?: number;
  prices?: Record<string, number>;
  options?: string[];
  dietary: Dietary[];
  allergens: Allergen[];
  image: string;
  signature?: boolean;
  badge?: L10n;
};

export type Menu = {
  currency: string;
  categories: Category[];
  optionGroups: Record<string, OptionGroup>;
  items: MenuItem[];
};

export const menu = menuData as unknown as Menu;

export const DIETARY: Dietary[] = ["vegetarian", "vegan", "spicy", "glutenFreeOption"];

/** Lowest price an item can be ordered at. */
export function basePrice(item: MenuItem): number {
  if (item.prices) return Math.min(...Object.values(item.prices));
  return item.price ?? 0;
}

export function sizeChoices(item: MenuItem): OptionChoice[] {
  if (!item.prices) return [];
  return (menu.optionGroups.size?.choices ?? []).filter((c) => item.prices![c.id] !== undefined);
}

export function hasSauces(item: MenuItem) {
  return item.options?.includes("sauces") ?? false;
}

export function unitPrice(item: MenuItem, sizeId: string | undefined, sauceIds: string[]): number {
  const base = item.prices && sizeId ? item.prices[sizeId] ?? basePrice(item) : basePrice(item);
  const sauces = menu.optionGroups.sauces?.choices ?? [];
  const extras = sauceIds.reduce((sum, id) => sum + (sauces.find((s) => s.id === id)?.price ?? 0), 0);
  return Math.round((base + extras) * 100) / 100;
}

export function getItem(id: string) {
  return menu.items.find((i) => i.id === id);
}

export function formatPrice(value: number, lang: string) {
  return new Intl.NumberFormat(lang === "el" ? "el-CY" : "en-CY", { style: "currency", currency: "EUR" }).format(value);
}
