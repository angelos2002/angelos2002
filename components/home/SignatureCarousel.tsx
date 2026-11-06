"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import { Icon } from "@/components/ui/Icon";
import { Photo } from "@/components/ui/Photo";
import { tr } from "@/lib/i18n";
import { basePrice, hasVariants, formatPrice, menu } from "@/lib/menu";

export function SignatureCarousel() {
  const { lang, t } = useI18n();
  const track = useRef<HTMLDivElement>(null);
  const items = menu.items.filter((i) => i.signature);

  const scrollBy = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    el.scrollBy({ left: dir * ((card?.offsetWidth ?? 300) + 16), behavior: "smooth" });
  };

  return (
    <section className="relative py-20 md:py-28" aria-labelledby="sig-title">
      <div className="container-x flex items-end justify-between gap-6">
        <div>
          <p className="kicker">Signature</p>
          <h2 id="sig-title" className="heading mt-2 text-5xl md:text-7xl">{t.home.signatureTitle}</h2>
          <p className="mt-3 text-cream-muted">{t.home.signatureSub}</p>
        </div>
        <div className="hidden gap-2 md:flex">
          <button type="button" onClick={() => scrollBy(-1)} className="grid h-12 w-12 place-items-center rounded-full border border-black/10 hover:border-flame" aria-label={t.home.prev}>
            <Icon name="arrowLeft" />
          </button>
          <button type="button" onClick={() => scrollBy(1)} className="grid h-12 w-12 place-items-center rounded-full border border-black/10 hover:border-flame" aria-label={t.home.nextSlide}>
            <Icon name="arrowRight" />
          </button>
        </div>
      </div>
      <div
        ref={track}
        className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-6 sm:px-6 lg:px-[max(2rem,calc((100vw-80rem)/2+2rem))]"
        role="list"
      >
        {items.map((item, i) => (
          <motion.article
            key={item.id}
            data-card
            role="listitem"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            className="group glass relative w-[78vw] max-w-[340px] shrink-0 snap-start overflow-hidden p-0 sm:w-[340px]"
          >
            <Link href={`/${lang}/menu?item=${item.id}`} className="block">
              <Photo src={item.image} alt={tr(item.name, lang)} className="aspect-[4/3.4] w-full transition-transform duration-700 group-hover:scale-[1.04]" sizes="340px" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-[85%] bg-gradient-to-b from-transparent via-transparent to-ink-800" />
              {item.badge && (
                <span className="absolute left-4 top-4 rounded-full bg-flame px-3 py-1 text-xs font-bold uppercase text-onaccent shadow-glow-sm">{tr(item.badge, lang)}</span>
              )}
              <div className="relative -mt-14 p-5">
                <h3 className="heading text-3xl">{tr(item.name, lang)}</h3>
                <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm text-cream-muted">{tr(item.description, lang)}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-cream-dim">
                    {hasVariants(item) ? `${t.menu.from} ` : ""}
                    <span className="font-display text-2xl font-bold text-cream">{formatPrice(basePrice(item), lang)}</span>
                  </span>
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-flame text-onaccent shadow-glow-sm transition group-hover:scale-110">
                    <Icon name="plus" />
                  </span>
                </div>
              </div>
            </Link>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
