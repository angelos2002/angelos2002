import en, { type Dictionary } from "./dictionaries/en";
import el from "./dictionaries/el";

export const locales = ["el", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "el";

export type L10n = { el: string; en: string };
export type { Dictionary };

const dictionaries: Record<Locale, Dictionary> = { el, en };

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getDictionary(lang: string): Dictionary {
  return dictionaries[isLocale(lang) ? lang : defaultLocale];
}

/** Replace {placeholders} in a dictionary string. */
export function fmt(str: string, vars: Record<string, string | number>) {
  return str.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

export function tr(value: L10n, lang: Locale) {
  return value[lang] ?? value.en;
}

/** Swap the locale segment of a pathname. */
export function switchLocalePath(pathname: string, to: Locale) {
  const parts = pathname.split("/");
  if (parts[1] && isLocale(parts[1])) parts[1] = to;
  else parts.splice(1, 0, to);
  return parts.join("/") || `/${to}`;
}
