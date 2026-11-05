import { CareersForm } from "@/components/forms/CareersForm";
import { getDictionary, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  return pageMetadata(lang, "careers");
}

export default async function CareersPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const t = getDictionary(lang);
  return (
    <div className="container-x pt-24 md:pt-32">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr]">
        <header>
          <p className="kicker">{t.careers.kicker}</p>
          <h1 className="heading mt-2 text-6xl md:text-8xl">{t.careers.title}</h1>
          <p className="mt-4 text-lg text-cream-muted">{t.careers.sub}</p>
        </header>
        <CareersForm />
      </div>
    </div>
  );
}
