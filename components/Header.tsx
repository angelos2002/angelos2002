"use client";

import { AnimatePresence, motion, useAnimationControls, useMotionValueEvent, useScroll } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/components/providers/CartProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import { PHONE, PHONE_HREF } from "@/lib/site";
import { Icon } from "./ui/Icon";
import { LanguageToggle } from "./ui/LanguageToggle";
import { Logo } from "./ui/Logo";

export function BagButton({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  const { count, setOpen, registerTarget, bump, hydrated } = useCart();
  const controls = useAnimationControls();
  useEffect(() => {
    if (bump) controls.start({ scale: [1, 1.22, 1], transition: { duration: 0.35 } });
  }, [bump, controls]);
  return (
    <motion.button
      ref={registerTarget}
      type="button"
      onClick={() => setOpen(true)}
      animate={controls}
      className={`relative grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-cream hover:border-flame/60 ${className}`}
      aria-label={`${t.menu.bag} (${count})`}
    >
      <Icon name="bag" />
      {hydrated && count > 0 && (
        <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-flame px-1 text-[11px] font-bold text-ink shadow-glow-sm">
          {count}
        </span>
      )}
    </motion.button>
  );
}

export function Header() {
  const { lang, t } = useI18n();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));
  useEffect(() => setMenuOpen(false), [pathname]);

  const links = [
    { href: `/${lang}/menu`, label: t.nav.menu },
    { href: `/${lang}/guest-dishes`, label: t.nav.guest },
    { href: `/${lang}/locations`, label: t.nav.locations },
    { href: `/${lang}/reviews`, label: t.nav.reviews },
    { href: `/${lang}/catering`, label: t.nav.catering },
    { href: `/${lang}/about`, label: t.nav.about },
    { href: `/${lang}/careers`, label: t.nav.careers },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={`transition-all duration-300 ${scrolled || menuOpen ? "border-b border-white/5 bg-ink/75 backdrop-blur-xl" : "bg-transparent"}`}
      >
        <div className="container-x flex h-16 items-center justify-between gap-4 md:h-20">
          <Link href={`/${lang}`} aria-label="Street Food Rey" className="shrink-0">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {links.map((l) => {
              const active = pathname?.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative rounded-full px-3.5 py-2 text-sm font-medium transition ${active ? "text-cream" : "text-cream-muted hover:text-cream"}`}
                >
                  {active && <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-full bg-white/[0.07]" />}
                  {l.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <a href={PHONE_HREF} className="hidden items-center gap-2 text-sm text-cream-muted hover:text-cream xl:flex">
              <Icon name="phone" className="h-4 w-4" /> {PHONE}
            </a>
            <BagButton />
            <Link href={`/${lang}/menu`} className="btn-primary hidden px-5 py-2.5 text-base md:inline-flex">
              {t.common.orderNow}
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 lg:hidden"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? t.nav.closeMenu : t.nav.openMenu}
            >
              <Icon name={menuOpen ? "x" : "menu"} />
            </button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            aria-label="Mobile"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="glass-strong mx-3 mt-2 rounded-3xl p-3 lg:hidden"
          >
            <ul>
              {[{ href: `/${lang}`, label: t.nav.home }, ...links].map((l, i) => (
                <motion.li key={l.href} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                  <Link href={l.href} className="flex items-center justify-between rounded-2xl px-4 py-3.5 font-display text-2xl font-bold uppercase hover:bg-white/5">
                    {l.label}
                    <Icon name="arrowRight" className="h-5 w-5 text-flame" />
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
