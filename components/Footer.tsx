import Link from "next/link";
import { getDictionary, tr, type Locale } from "@/lib/i18n";
import { locations } from "@/lib/locations";
import { PHONE, PHONE_HREF, SOCIAL } from "@/lib/site";
import { Icon } from "./ui/Icon";
import { Logo } from "./ui/Logo";

export function Footer({ lang }: { lang: Locale }) {
  const t = getDictionary(lang);
  const links = [
    [`/${lang}/menu`, t.nav.menu],
    [`/${lang}/locations`, t.nav.locations],
    [`/${lang}/reviews`, t.nav.reviews],
    [`/${lang}/catering`, t.nav.catering],
    [`/${lang}/about`, t.nav.about],
    [`/${lang}/careers`, t.nav.careers],
  ];
  return (
    <footer className="relative mt-24 border-t border-white/5 bg-ink-800/60 pb-[calc(var(--mobile-bar)+1.5rem)] pt-14">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-flame/60 to-transparent" />
      <div className="container-x grid gap-10 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-cream-dim">{t.footer.tagline}</p>
          <div className="mt-5 flex gap-2">
            <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid h-10 w-10 place-items-center rounded-full border border-white/10 hover:border-flame hover:text-flame">
              <Icon name="instagram" />
            </a>
            <a href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="grid h-10 w-10 place-items-center rounded-full border border-white/10 hover:border-flame hover:text-flame">
              <Icon name="facebook" />
            </a>
          </div>
        </div>
        <div>
          <h3 className="kicker mb-4">{t.footer.explore}</h3>
          <ul className="space-y-2 text-sm text-cream-muted">
            {links.map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="hover:text-cream">{label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="kicker mb-4">{t.footer.visit}</h3>
          <ul className="space-y-3 text-sm">
            {locations.map((l) => (
              <li key={l.id}>
                <span className="block font-semibold text-cream">{tr(l.name, lang)}</span>
                <span className="text-cream-dim">{tr(l.address, lang)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="kicker mb-4">{t.footer.contact}</h3>
          <a href={PHONE_HREF} className="flex items-center gap-2 font-display text-2xl font-bold hover:text-flame">
            <Icon name="phone" /> {PHONE}
          </a>
        </div>
      </div>
      <div className="container-x mt-12 flex flex-col gap-2 border-t border-white/5 pt-6 text-xs text-cream-dim sm:flex-row sm:justify-between">
        <span>© {new Date().getFullYear()} Street Food Rey. {t.footer.rights}</span>
        <span>{t.footer.photoNote}</span>
      </div>
    </footer>
  );
}
