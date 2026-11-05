import Link from "next/link";
import { ExplodingBurger } from "@/components/home/ExplodingBurger";
import { ReviewsMarquee } from "@/components/home/ReviewsMarquee";
import { SignatureCarousel } from "@/components/home/SignatureCarousel";
import { LocationCard } from "@/components/LocationCard";
import { Icon } from "@/components/ui/Icon";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import { getDictionary, type Locale } from "@/lib/i18n";
import { locations } from "@/lib/locations";
import { getLatestAll } from "@/lib/review-store";
import { pageMetadata } from "@/lib/seo";
import featured from "@/data/featured-reviews.json";
import { SOCIAL } from "@/lib/site";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  return pageMetadata(lang, "home");
}

export default async function Home({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const t = getDictionary(lang);
  const latest = await getLatestAll(12).catch(() => []);
  const reviews = [...latest, ...featured.reviews.map((r, i) => ({ ...r, id: `featured-${i}` }))];

  return (
    <>
      <ExplodingBurger />
      <SignatureCarousel />

      <section className="container-x py-20 md:py-28" aria-labelledby="loc-title">
        <Reveal>
          <p className="kicker">{t.nav.locations}</p>
          <h2 id="loc-title" className="heading mt-2 text-5xl md:text-7xl">{t.home.locationsTitle}</h2>
          <p className="mt-3 text-cream-muted">{t.home.locationsSub}</p>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {locations.map((l, i) => (
            <Reveal key={l.id} delay={i * 0.08}>
              <LocationCard loc={l} />
            </Reveal>
          ))}
        </div>
      </section>

      <ReviewsMarquee reviews={reviews} lang={lang} title={t.home.reviewsTitle} />

      <section className="container-x grid gap-5 pb-4 md:grid-cols-2">
        {[
          { href: SOCIAL.instagram, icon: "instagram", title: t.home.instaTitle, text: t.home.instaText, cta: "Instagram" },
          { href: SOCIAL.facebook, icon: "facebook", title: t.home.fbTitle, text: t.home.fbText, cta: "Facebook" },
        ].map((s, i) => (
          <Reveal key={s.icon} delay={i * 0.08}>
            <a href={s.href} target="_blank" rel="noopener noreferrer" className="glass group flex h-full items-start gap-5 p-6 transition hover:border-flame/40">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-flame/15 text-flame shadow-glow-sm">
                <Icon name={s.icon} className="h-7 w-7" />
              </span>
              <span>
                <span className="heading block text-2xl">{s.title}</span>
                <span className="mt-1 block text-sm text-cream-muted">{s.text}</span>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-flame">
                  @streetfoodrey <Icon name="arrowRight" className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </span>
            </a>
          </Reveal>
        ))}
      </section>

      <section className="container-x py-12 md:py-20">
        <Reveal>
          <div className="glass relative grid overflow-hidden md:grid-cols-2">
            <div className="relative z-10 p-8 md:p-14">
              <p className="kicker">{t.home.cateringKicker}</p>
              <h2 className="heading mt-3 text-5xl md:text-6xl">{t.home.cateringTitle}</h2>
              <p className="mt-4 max-w-md text-cream-muted">{t.home.cateringText}</p>
              <Link href={`/${lang}/catering`} className="btn-primary mt-8">
                {t.home.cateringCta} <Icon name="arrowRight" />
              </Link>
            </div>
            <div className="relative min-h-[280px]">
              <Photo
                src="https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=1400&q=80"
                alt="Food truck catering"
                className="absolute inset-0 h-full w-full"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-800 via-transparent to-transparent md:bg-gradient-to-r" />
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
