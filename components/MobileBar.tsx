"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/providers/CartProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import { tr } from "@/lib/i18n";
import { directionsUrl, locations } from "@/lib/locations";
import { PHONE_HREF } from "@/lib/site";
import { Icon } from "./ui/Icon";
import { OpenBadge } from "./ui/OpenBadge";
import { Sheet } from "./ui/Sheet";

export function DirectionsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lang, t } = useI18n();
  return (
    <Sheet open={open} onClose={onClose} title={t.common.chooseLocation} closeLabel={t.common.close}>
      <ul className="space-y-3">
        {locations.map((l) => (
          <li key={l.id}>
            <a
              href={directionsUrl(l)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:border-flame/60"
            >
              <span>
                <span className="block font-display text-xl font-bold uppercase">{tr(l.name, lang)}</span>
                <span className="block text-sm text-cream-dim">{tr(l.address, lang)}</span>
                <OpenBadge locationId={l.id} className="mt-2" />
              </span>
              <Icon name="arrowRight" className="h-5 w-5 shrink-0 text-flame" />
            </a>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}

export function MobileBar() {
  const { lang, t } = useI18n();
  const { count, hydrated } = useCart();
  const [dirOpen, setDirOpen] = useState(false);
  const item = "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-semibold uppercase tracking-wide";
  return (
    <>
      <nav
        aria-label="Quick actions"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
      >
        <div className="flex h-[68px] items-stretch px-2">
          <Link href={hydrated && count > 0 ? `/${lang}/checkout` : `/${lang}/menu`} className={`${item} relative mx-1 my-2 rounded-2xl bg-flame text-ink shadow-glow`}>
            <Icon name="bag" className="h-5 w-5" />
            {t.nav.order}
            {hydrated && count > 0 && (
              <span className="absolute right-2 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 text-[10px] text-flame">{count}</span>
            )}
          </Link>
          <Link href={`/${lang}/menu`} className={`${item} text-cream-muted hover:text-cream`}>
            <Icon name="list" className="h-5 w-5" />
            {t.nav.menu}
          </Link>
          <a href={PHONE_HREF} className={`${item} text-cream-muted hover:text-cream`}>
            <Icon name="phone" className="h-5 w-5" />
            {t.nav.call}
          </a>
          <button type="button" onClick={() => setDirOpen(true)} className={`${item} text-cream-muted hover:text-cream`}>
            <Icon name="pin" className="h-5 w-5" />
            {t.nav.directions}
          </button>
        </div>
      </nav>
      <DirectionsSheet open={dirOpen} onClose={() => setDirOpen(false)} />
    </>
  );
}
