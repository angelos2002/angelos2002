"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/components/providers/I18nProvider";
import { locales, switchLocalePath } from "@/lib/i18n";

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, t } = useI18n();
  const pathname = usePathname() || `/${lang}`;
  return (
    <div role="group" aria-label={t.nav.language} className={`relative flex rounded-full border border-white/10 bg-white/5 p-0.5 text-xs font-bold ${className}`}>
      {locales.map((l) => {
        const active = l === lang;
        return (
          <Link
            key={l}
            href={switchLocalePath(pathname, l)}
            hrefLang={l}
            aria-current={active ? "true" : undefined}
            onClick={() => {
              document.cookie = `lang=${l};path=/;max-age=31536000;samesite=lax`;
            }}
            className={`relative z-10 rounded-full px-2.5 py-1.5 uppercase transition ${active ? "bg-flame text-ink shadow-glow-sm" : "text-cream-muted hover:text-cream"}`}
          >
            {l === "el" ? "ΕΛ" : "EN"}
          </Link>
        );
      })}
    </div>
  );
}
