"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/components/providers/I18nProvider";

const KEY = "sfr-consent";
type Choice = "granted" | "denied";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function update(choice: Choice) {
  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line prefer-rest-params
  const gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  gtag("consent", "update", { analytics_storage: choice, ad_storage: choice, ad_user_data: choice, ad_personalization: choice });
  window.dataLayer.push({ event: "consent_update", consent: choice });
}

/** Consent banner (Google Consent Mode v2). Defaults are set to "denied" in the layout before GTM loads. */
export function CookieConsent() {
  const { lang, t } = useI18n();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(KEY);
    } catch {}
    if (!saved) setOpen(true);
    const reopen = () => setOpen(true);
    window.addEventListener("sfr:cookies", reopen);
    return () => window.removeEventListener("sfr:cookies", reopen);
  }, []);
  const choose = (c: Choice) => {
    try {
      localStorage.setItem(KEY, c);
    } catch {}
    update(c);
    setOpen(false);
  };
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-label="Cookies"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          className="glass-strong fixed inset-x-3 bottom-[calc(var(--mobile-bar)+0.75rem)] z-[70] mx-auto max-w-xl p-5 md:bottom-6"
        >
          <p className="text-sm text-cream-muted">
            {t.cookies.text}{" "}
            <Link href={`/${lang}/privacy`} className="underline hover:text-cream">{t.footer.privacy}</Link>
          </p>
          <div className="mt-4 flex gap-2">
            <button type="button" onClick={() => choose("granted")} className="btn-primary flex-1 py-2 text-base">{t.cookies.accept}</button>
            <button type="button" onClick={() => choose("denied")} className="btn-ghost flex-1 py-2 text-base">{t.cookies.decline}</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function CookieSettingsLink({ label }: { label: string }) {
  return (
    <button type="button" className="hover:text-cream" onClick={() => window.dispatchEvent(new Event("sfr:cookies"))}>
      {label}
    </button>
  );
}
