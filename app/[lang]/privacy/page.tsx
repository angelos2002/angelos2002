import { getDictionary, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { PHONE } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  return pageMetadata(lang, "privacy");
}

/** Template privacy notice — have it reviewed before launch. */
export default async function Privacy({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const p = getDictionary(lang).privacy;
  return (
    <div className="container-x max-w-3xl pt-24 md:pt-32">
      <h1 className="heading text-5xl md:text-7xl">{p.title}</h1>
      <p className="mt-3 text-sm text-cream-dim">{p.updated}</p>
      <div className="mt-10 space-y-8">
        {p.sections.map((s) => (
          <section key={s.h}>
            <h2 className="heading mb-2 text-2xl">{s.h}</h2>
            <p className="whitespace-pre-line text-cream-muted">{s.p.replace("{phone}", PHONE)}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
