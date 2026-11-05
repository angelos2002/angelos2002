"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CartLines } from "@/components/CartDrawer";
import { useCart } from "@/components/providers/CartProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import { AnimatedPrice } from "@/components/ui/AnimatedPrice";
import { Icon } from "@/components/ui/Icon";
import { Photo } from "@/components/ui/Photo";
import { tr } from "@/lib/i18n";
import { basePrice, hasVariants, DIETARY, formatPrice, getItem, menu, type Dietary, type MenuItem } from "@/lib/menu";
import { AllergenIcons, DietaryBadges, dietIcon } from "./DietaryIcons";
import { ItemSheet } from "./ItemSheet";

const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

function ItemCard({ item, onOpen }: { item: MenuItem; onOpen: (i: MenuItem) => void }) {
  const { lang, t } = useI18n();
  return (
    <motion.li layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <button
        type="button"
        onClick={() => onOpen(item)}
        className="glass group flex h-full w-full gap-4 p-3 text-left transition hover:border-flame/40 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame"
      >
        <Photo src={item.image} alt="" className="h-28 w-28 shrink-0 rounded-xl sm:h-32 sm:w-32" sizes="128px" />
        <span className="flex min-w-0 flex-1 flex-col py-1">
          <span className="flex items-start justify-between gap-2">
            <span className="font-display text-xl font-bold uppercase leading-tight">{tr(item.name, lang)}</span>
            {item.badge && <span className="shrink-0 rounded-full bg-flame/15 px-2 py-0.5 text-[10px] font-bold uppercase text-flame">{tr(item.badge, lang)}</span>}
          </span>
          {tr(item.description, lang) && <span className="mt-1 line-clamp-2 text-sm text-cream-dim">{tr(item.description, lang)}</span>}
          <span className="mt-2 flex flex-wrap gap-1.5">
            <DietaryBadges items={item.dietary} />
            <AllergenIcons items={item.allergens} />
          </span>
          <span className="mt-auto flex items-center justify-between pt-2">
            <span className="text-sm text-cream-dim">
              {hasVariants(item) ? `${t.menu.from} ` : ""}
              <span className="font-semibold text-cream">{formatPrice(basePrice(item), lang)}</span>
            </span>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-flame text-ink shadow-glow-sm transition group-hover:scale-110" aria-hidden>
              <Icon name="plus" className="h-4 w-4" />
            </span>
          </span>
        </span>
      </button>
    </motion.li>
  );
}

export function MenuBrowser() {
  const { lang, t } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const { count, subtotal, setOpen, registerTarget, hydrated } = useCart();
  const [query, setQuery] = useState("");
  const [diet, setDiet] = useState<Dietary[]>([]);
  const [active, setActive] = useState(menu.categories[0].id);
  const [selected, setSelected] = useState<MenuItem | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const clickScrolling = useRef(false);

  // Deep link: /menu?item=limassol-burger
  useEffect(() => {
    const id = params.get("item");
    const item = id ? getItem(id) : undefined;
    if (item) setSelected(item);
  }, [params]);

  const closeSheet = useCallback(() => {
    setSelected(null);
    if (params.get("item")) router.replace(`/${lang}/menu`, { scroll: false });
  }, [params, router, lang]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return menu.items.filter((i) => {
      if (diet.length && !diet.every((d) => i.dietary.includes(d))) return false;
      if (!q) return true;
      return normalize(`${i.name.el} ${i.name.en} ${i.description.el} ${i.description.en}`).includes(q);
    });
  }, [query, diet]);

  const sections = menu.categories
    .map((c) => ({ ...c, items: filtered.filter((i) => i.category === c.id) }))
    .filter((c) => c.items.length > 0);

  // Track active category while scrolling.
  useEffect(() => {
    const els = sections.map((s) => document.getElementById(`cat-${s.id}`)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        if (clickScrolling.current) return;
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id.replace("cat-", ""));
      },
      { rootMargin: "-180px 0px -55% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sections.map((s) => s.id).join()]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep the active tab in view.
  useEffect(() => {
    const tab = tabsRef.current?.querySelector<HTMLElement>(`[data-tab="${active}"]`);
    tab?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [active]);

  const goTo = (id: string) => {
    const el = document.getElementById(`cat-${id}`);
    if (!el) return;
    setActive(id);
    clickScrolling.current = true;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = el.getBoundingClientRect().top + window.scrollY - (window.innerWidth >= 768 ? 220 : 196);
    window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
    window.setTimeout(() => (clickScrolling.current = false), 800);
  };

  const toggleDiet = (d: Dietary) => setDiet((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]));

  return (
    <div className="pb-[calc(var(--mobile-bar)+80px)] lg:pb-0">
      {/* Sticky controls */}
      <div className="sticky top-16 z-30 border-b border-white/5 bg-ink/85 backdrop-blur-xl md:top-20">
        <div className="container-x py-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <label className="relative flex-1">
              <span className="sr-only">{t.menu.search}</span>
              <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-cream-dim" />
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.menu.search} className="field rounded-full py-2.5 pl-11" />
            </label>
            <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0" role="group" aria-label={t.menu.filters}>
              {DIETARY.map((d) => {
                const on = diet.includes(d);
                return (
                  <button key={d} type="button" aria-pressed={on} onClick={() => toggleDiet(d)} className={`chip shrink-0 ${on ? "chip-active" : ""}`}>
                    <Icon name={dietIcon(d).icon} className="h-4 w-4" />
                    {t.dietary[d]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div ref={tabsRef} className="no-scrollbar container-x flex gap-1 overflow-x-auto pb-2" role="tablist" aria-label={t.nav.menu}>
          {sections.map((c) => {
            const on = active === c.id;
            return (
              <button
                key={c.id}
                data-tab={c.id}
                role="tab"
                aria-selected={on}
                type="button"
                onClick={() => goTo(c.id)}
                className={`relative shrink-0 rounded-full px-4 py-2 font-display text-base font-bold uppercase tracking-wide transition ${on ? "text-ink" : "text-cream-muted hover:text-cream"}`}
              >
                {on && <motion.span layoutId="cat-pill" className="absolute inset-0 -z-10 rounded-full bg-flame shadow-glow-sm" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                {tr(c.name, lang)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="container-x mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          {sections.length === 0 && (
            <div className="glass p-10 text-center text-cream-muted">
              <p>{t.menu.noResults}</p>
              <button type="button" className="btn-ghost mt-5" onClick={() => { setQuery(""); setDiet([]); }}>
                {t.menu.clear}
              </button>
            </div>
          )}
          {sections.map((c) => (
            <section key={c.id} id={`cat-${c.id}`} className="mb-12 scroll-mt-56" aria-labelledby={`h-${c.id}`}>
              <h2 id={`h-${c.id}`} className="heading mb-5 flex items-center gap-3 text-4xl md:text-5xl">
                {tr(c.name, lang)}
                <span className="h-px flex-1 bg-gradient-to-r from-flame/50 to-transparent" />
              </h2>
              <ul className="grid gap-3 md:grid-cols-2">
                <AnimatePresence initial={false}>
                  {c.items.map((item) => (
                    <ItemCard key={item.id} item={item} onOpen={setSelected} />
                  ))}
                </AnimatePresence>
              </ul>
            </section>
          ))}
          <p className="mt-6 flex items-start gap-2 text-xs text-cream-dim">
            <Icon name="egg" className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
            {t.menu.allergenNote}
          </p>
        </div>

        {/* Desktop cart */}
        <aside className="hidden lg:block">
          <div className="glass sticky top-[250px] flex max-h-[calc(100vh-280px)] flex-col p-5">
            <div className="mb-4 flex items-center gap-3">
              <span ref={registerTarget} className="grid h-10 w-10 place-items-center rounded-full bg-flame/15 text-flame">
                <Icon name="bag" />
              </span>
              <h2 className="heading text-2xl">{t.menu.bag}</h2>
            </div>
            <div className="-mx-1 flex-1 overflow-y-auto px-1">
              {hydrated && count > 0 ? <CartLines compact /> : <p className="py-6 text-sm text-cream-dim">{t.menu.emptyBag}</p>}
            </div>
            {hydrated && count > 0 && (
              <div className="mt-4 border-t border-white/5 pt-4">
                <div className="mb-3 flex items-baseline justify-between">
                  <span className="text-cream-muted">{t.checkout.subtotal}</span>
                  <AnimatedPrice value={subtotal} lang={lang} className="font-display text-2xl font-bold" />
                </div>
                <Link href={`/${lang}/checkout`} className="btn-primary w-full">
                  {t.menu.checkout} <Icon name="arrowRight" />
                </Link>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Mobile / tablet sticky cart bar */}
      <div className="fixed inset-x-0 bottom-[calc(var(--mobile-bar)+env(safe-area-inset-bottom))] z-30 px-3 pb-3 lg:hidden">
        <AnimatePresence>
          {hydrated && count > 0 && (
            <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} className="glass-strong mx-auto flex max-w-xl items-center gap-3 rounded-full p-2 pl-3">
              <button type="button" onClick={() => setOpen(true)} className="flex flex-1 items-center gap-3 text-left" aria-label={t.menu.viewBag}>
                <span ref={registerTarget} className="relative grid h-11 w-11 place-items-center rounded-full bg-flame/15 text-flame">
                  <Icon name="bag" />
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-flame px-1 text-[11px] font-bold text-ink">{count}</span>
                </span>
                <span>
                  <span className="block text-xs text-cream-dim">{t.menu.viewBag}</span>
                  <AnimatedPrice value={subtotal} lang={lang} className="font-display text-xl font-bold" />
                </span>
              </button>
              <Link href={`/${lang}/checkout`} className="btn-primary px-5 py-3 text-base">
                {t.menu.checkout}
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ItemSheet item={selected} onClose={closeSheet} />
    </div>
  );
}
