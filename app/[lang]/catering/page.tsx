import { CateringForm } from "@/components/forms/CateringForm";
import { Icon } from "@/components/ui/Icon";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import { VideoFacade } from "@/components/VideoFacade";
import { fmt, getDictionary, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { CATERING_VIDEO } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  return pageMetadata(lang, "catering");
}

export default async function CateringPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const t = getDictionary(lang);
  const c = t.catering;
  return (
    <div className="pt-24 md:pt-32">
      <header className="container-x">
        <p className="kicker">{c.kicker}</p>
        <h1 className="heading mt-2 max-w-4xl text-6xl md:text-8xl">{c.title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-cream-muted">{c.sub}</p>
        <a href="#enquire" className="btn-primary mt-8">
          {c.formTitle} <Icon name="arrowRight" />
        </a>
      </header>

      <section className="container-x mt-20" aria-labelledby="pk">
        <h2 id="pk" className="heading text-4xl md:text-6xl">{c.packagesTitle}</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {c.packages.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.08}>
              <article className={`glass relative h-full p-7 ${p.featured ? "border-flame/60 shadow-glow" : ""}`}>
                {p.featured && <span className="absolute -top-3 left-7 rounded-full bg-flame px-3 py-1 text-xs font-bold uppercase text-ink">★ Popular</span>}
                <h3 className="heading text-3xl">{p.name}</h3>
                <p className="mt-4 flex items-baseline gap-2">
                  <span className="font-display text-6xl font-extrabold text-flame">{p.price}</span>
                  <span className="text-sm text-cream-dim">{c.perPerson}</span>
                </p>
                <p className="mt-1 text-xs text-cream-dim">{fmt(c.minGuests, { n: p.min })}</p>
                <ul className="mt-6 space-y-2.5 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-flame" /> {f}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-x mt-24 grid items-center gap-10 lg:grid-cols-2" aria-labelledby="truck">
        <Reveal>
          <Photo
            src="https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=1400&q=80"
            alt="Street Food Rey food truck"
            className="glass aspect-[4/3] w-full"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        </Reveal>
        <Reveal delay={0.1}>
          <h2 id="truck" className="heading text-4xl md:text-6xl">{c.truckTitle}</h2>
          <p className="mt-4 text-cream-muted">{c.truckText}</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {c.truckPoints.map((pt) => (
              <li key={pt} className="glass flex items-center gap-3 p-4 text-sm">
                <Icon name="flame" className="h-5 w-5 shrink-0 text-flame" /> {pt}
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <section className="container-x mt-24" aria-labelledby="vid">
        <h2 id="vid" className="heading mb-6 text-4xl md:text-6xl">{c.videoTitle}</h2>
        <VideoFacade {...CATERING_VIDEO} title={c.videoTitle} />
      </section>

      <section id="enquire" className="container-x mt-24 grid scroll-mt-28 gap-8 lg:grid-cols-[1fr_1.4fr]" aria-labelledby="enq">
        <div>
          <h2 id="enq" className="heading text-4xl md:text-6xl">{c.formTitle}</h2>
          <p className="mt-4 text-cream-muted">{c.formSub}</p>
        </div>
        <CateringForm />
      </section>
    </div>
  );
}
