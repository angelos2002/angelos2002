import { CateringForm } from "@/components/forms/CateringForm";
import { Icon } from "@/components/ui/Icon";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import { VideoFacade } from "@/components/VideoFacade";
import { getDictionary, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { CATERING_VIDEO, SOCIAL } from "@/lib/site";

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
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {c.packages.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.08}>
              <article className="glass grid h-full overflow-hidden sm:grid-cols-[1fr_1.1fr]">
                <Photo
                  src={i === 0 ? "/images/menu/chicken-nuggets.jpg" : "https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=1200&q=80"}
                  alt={p.name}
                  className="min-h-[220px] w-full"
                  sizes="(min-width: 1024px) 25vw, 100vw"
                />
                <div className="p-7">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-flame/15 text-flame shadow-glow-sm">
                    <Icon name={p.icon} className="h-6 w-6" />
                  </span>
                  <h3 className="heading mt-5 text-3xl">{p.name}</h3>
                  <p className="mt-3 text-cream-muted">{p.text}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-sm text-cream-dim">
          <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-flame">{c.socialNote}</a>
        </p>
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
