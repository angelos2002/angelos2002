import { Stars } from "@/components/ui/Stars";
import { tr, type Locale } from "@/lib/i18n";
import { getLocation } from "@/lib/locations";
import type { Review } from "@/lib/reviews";

export function ReviewsMarquee({ reviews, lang, title }: { reviews: Review[]; lang: Locale; title: string }) {
  if (reviews.length === 0) return null;
  const list = reviews.length < 6 ? [...reviews, ...reviews] : reviews;
  return (
    <section className="py-20 md:py-28" aria-labelledby="rev-title">
      <div className="container-x">
        <h2 id="rev-title" className="heading text-5xl md:text-7xl">{title}</h2>
      </div>
      <div className="group relative mt-10 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
        <ul className="flex w-max animate-marquee gap-4 group-hover:[animation-play-state:paused] motion-reduce:w-full motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:justify-center">
          {[...list, ...list].map((r, i) => (
            <li key={`${r.id}-${i}`} aria-hidden={i >= list.length} className="glass w-[300px] shrink-0 p-5 sm:w-[360px] motion-reduce:[&[aria-hidden=true]]:hidden">
              <Stars value={r.rating} />
              <p className="mt-3 line-clamp-4 text-cream">“{r.comment}”</p>
              <p className="mt-4 text-sm text-cream-dim">
                <span className="font-semibold text-cream-muted">{r.name}</span> · {getLocation(r.location) ? tr(getLocation(r.location)!.name, lang) : ""}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
