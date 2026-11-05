import Link from "next/link";
import { HoursTable } from "@/components/HoursTable";
import { Icon } from "@/components/ui/Icon";
import { OpenBadge } from "@/components/ui/OpenBadge";
import { Reveal } from "@/components/ui/Reveal";
import { fmt, getDictionary, tr, type Locale } from "@/lib/i18n";
import { directionsUrl, locations, mapEmbedUrl, telHref } from "@/lib/locations";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  return pageMetadata(lang, "locations");
}

export default async function LocationsPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const t = getDictionary(lang);
  return (
    <div className="container-x pt-24 md:pt-32">
      <header className="mb-12">
        <p className="kicker">{t.nav.locations}</p>
        <h1 className="heading mt-2 text-6xl md:text-8xl">{t.locations.title}</h1>
        <p className="mt-3 text-cream-muted">{t.locations.sub}</p>
      </header>

      <div className="space-y-10">
        {locations.map((l) => {
          const name = tr(l.name, lang);
          return (
            <Reveal key={l.id}>
              <section id={l.id} className="glass grid scroll-mt-28 overflow-hidden lg:grid-cols-[1.2fr_1fr]" aria-labelledby={`loc-${l.id}`}>
                <div className="relative min-h-[280px] bg-ink-700 lg:min-h-[460px]">
                  <iframe
                    title={fmt(t.locations.map, { name })}
                    src={mapEmbedUrl(l)}
                    className="absolute inset-0 h-full w-full border-0 [filter:invert(0.92)_hue-rotate(180deg)_saturate(0.6)_brightness(0.9)]"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
                <div className="flex flex-col p-6 md:p-8">
                  <OpenBadge locationId={l.id} className="self-start" />
                  <h2 id={`loc-${l.id}`} className="heading mt-4 text-5xl">{name}</h2>
                  <p className="mt-2 flex items-start gap-2 text-cream-muted">
                    <Icon name="pin" className="mt-0.5 h-5 w-5 shrink-0 text-flame" /> {tr(l.address, lang)}
                  </p>
                  {l.seasonal && l.seasonStart && l.seasonEnd && (
                    <p className="mt-2 text-sm text-ember">
                      {fmt(t.locations.summerOnly, { start: l.seasonStart.split("-").reverse().join("/"), end: l.seasonEnd.split("-").reverse().join("/") })}
                    </p>
                  )}
                  {l.modes.includes("delivery") && (
                    <p className="mt-2 flex items-center gap-2 text-sm text-cream-muted">
                      <Icon name="truck" className="h-4 w-4 text-flame" /> {t.locations.delivery}
                    </p>
                  )}
                  <div className="mt-6">
                    <h3 className="kicker mb-2">{t.locations.hours}</h3>
                    <HoursTable loc={l} />
                  </div>
                  <div className={`mt-6 grid gap-2 ${l.phone ? "grid-cols-2" : "grid-cols-1"}`}>
                    {l.phone && (
                      <a href={telHref(l.phone)} className="btn-ghost px-3">
                        <Icon name="phone" className="h-4 w-4" /> {t.common.call}
                      </a>
                    )}
                    <a href={directionsUrl(l)} target="_blank" rel="noopener noreferrer" className="btn-primary px-3">
                      <Icon name="pin" className="h-4 w-4" /> {t.common.directions}
                    </a>
                  </div>
                  <Link href={`/${lang}/reviews#${l.id}`} className="mt-4 inline-flex items-center gap-1 text-sm text-cream-muted hover:text-flame">
                    {t.locations.reviews} <Icon name="arrowRight" className="h-4 w-4" />
                  </Link>
                </div>
              </section>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
