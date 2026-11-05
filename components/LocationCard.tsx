"use client";

import { useI18n } from "@/components/providers/I18nProvider";
import { fmt, tr } from "@/lib/i18n";
import { directionsUrl, type Location } from "@/lib/locations";
import { Icon } from "./ui/Icon";
import { OpenBadge } from "./ui/OpenBadge";
import { Photo } from "./ui/Photo";

export function LocationCard({ loc }: { loc: Location }) {
  const { lang, t } = useI18n();
  const tel = `tel:${loc.phone.replace(/\s+/g, "")}`;
  return (
    <article className="glass group flex flex-col overflow-hidden">
      <div className="relative">
        <Photo src={loc.image} alt={tr(loc.name, lang)} className="aspect-[16/9] w-full" sizes="(min-width: 768px) 33vw, 100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-800 via-ink-800/20 to-transparent" />
        <div className="absolute left-4 top-4">
          <OpenBadge locationId={loc.id} className="backdrop-blur-md" />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="heading text-3xl">{tr(loc.name, lang)}</h3>
        <p className="mt-1 flex items-start gap-2 text-sm text-cream-muted">
          <Icon name="pin" className="mt-0.5 h-4 w-4 shrink-0 text-flame" />
          {tr(loc.address, lang)}
        </p>
        {loc.seasonal && loc.seasonStart && loc.seasonEnd && (
          <p className="mt-2 text-xs text-ember">
            {fmt(t.locations.summerOnly, {
              start: loc.seasonStart.split("-").reverse().join("/"),
              end: loc.seasonEnd.split("-").reverse().join("/"),
            })}
          </p>
        )}
        <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
          <a href={tel} className="btn-ghost px-3 py-2.5 text-base">
            <Icon name="phone" className="h-4 w-4" /> {t.common.call}
          </a>
          <a href={directionsUrl(loc)} target="_blank" rel="noopener noreferrer" className="btn-primary px-3 py-2.5 text-base">
            <Icon name="pin" className="h-4 w-4" /> {t.common.directions}
          </a>
        </div>
      </div>
    </article>
  );
}
