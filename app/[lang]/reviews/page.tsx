import { ReviewSection } from "@/components/ReviewSection";
import { getDictionary, tr, type Locale } from "@/lib/i18n";
import { locations } from "@/lib/locations";
import { getSummary, isDemo } from "@/lib/review-store";
import { pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  return pageMetadata(lang, "reviews");
}

export default async function ReviewsPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const t = getDictionary(lang);
  const summaries = await Promise.all(
    locations.map((l) => getSummary(l.id, 6).catch(() => ({ average: 0, count: 0, reviews: [] }))),
  );
  const demo = isDemo();

  const schema = {
    "@context": "https://schema.org",
    "@graph": locations
      .map((l, i) => ({ l, s: summaries[i] }))
      .filter(({ s }) => s.count > 0)
      .map(({ l, s }) => ({
        "@type": "Restaurant",
        "@id": `${SITE_URL}/#${l.id}`,
        name: `Street Food Rey — ${tr(l.name, "en")}`,
        aggregateRating: { "@type": "AggregateRating", ratingValue: s.average, reviewCount: s.count, bestRating: 5, worstRating: 1 },
      })),
  };

  return (
    <div className="container-x pt-24 md:pt-32">
      <JsonLd data={schema} />
      <header className="mb-10">
        <p className="kicker">{t.nav.reviews}</p>
        <h1 className="heading mt-2 text-6xl md:text-8xl">{t.reviews.title}</h1>
        <p className="mt-3 text-cream-muted">{t.reviews.sub}</p>
        <nav className="mt-6 flex flex-wrap gap-2" aria-label={t.nav.locations}>
          {locations.map((l, i) => (
            <a key={l.id} href={`#${l.id}`} className="chip">
              {tr(l.name, lang)} <span className="text-flame">★ {summaries[i].count ? summaries[i].average.toFixed(1) : "–"}</span>
            </a>
          ))}
        </nav>
      </header>
      <div className="space-y-20">
        {locations.map((l, i) => (
          <ReviewSection key={l.id} loc={l} initial={summaries[i]} demo={demo} />
        ))}
      </div>
    </div>
  );
}
