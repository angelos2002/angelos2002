import { Suspense } from "react";
import { MenuBrowser } from "@/components/menu/MenuBrowser";
import { getDictionary, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  return pageMetadata(lang, "menu");
}

export default async function MenuPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const t = getDictionary(lang);
  return (
    <div className="pt-24 md:pt-32">
      <header className="container-x mb-6">
        <h1 className="heading text-6xl md:text-8xl">{t.menu.title}</h1>
        <p className="mt-2 text-cream-muted">{t.menu.sub}</p>
      </header>
      <Suspense>
        <MenuBrowser />
      </Suspense>
    </div>
  );
}
