import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import { getDictionary, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  return pageMetadata(lang, "about");
}

const ICONS = ["flame", "leaf", "pin"];

export default async function AboutPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const t = getDictionary(lang);
  const a = t.about;
  return (
    <div className="pt-24 md:pt-32">
      <section className="container-x grid items-center gap-10 lg:grid-cols-2">
        <Reveal>
          <p className="kicker">{a.kicker}</p>
          <h1 className="heading mt-2 text-6xl md:text-8xl">{a.title}</h1>
          <p className="mt-6 text-lg text-cream-muted">{a.p1}</p>
          <p className="mt-4 text-cream-muted">{a.p2}</p>
        </Reveal>
        <Reveal delay={0.1}>
          <Photo
            src="https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=1400&q=80"
            alt="Street Food Rey kitchen"
            className="glass aspect-[4/5] w-full"
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
          />
        </Reveal>
      </section>
      <section className="container-x mt-24" aria-labelledby="values">
        <h2 id="values" className="heading text-4xl md:text-6xl">{a.valuesTitle}</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {a.values.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.08}>
              <div className="glass h-full p-7">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-flame/15 text-flame shadow-glow-sm">
                  <Icon name={ICONS[i]} className="h-6 w-6" />
                </span>
                <h3 className="heading mt-5 text-3xl">{v.title}</h3>
                <p className="mt-2 text-cream-muted">{v.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-16 text-center">
          <Link href={`/${lang}/careers`} className="btn-primary">
            {a.careersCta} <Icon name="arrowRight" />
          </Link>
        </div>
      </section>
    </div>
  );
}
