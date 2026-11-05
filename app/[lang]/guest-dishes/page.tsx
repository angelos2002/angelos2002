import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import { getDictionary, tr, type Locale } from "@/lib/i18n";
import { formatPrice, menu } from "@/lib/menu";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  return pageMetadata(lang, "guest");
}

export default async function GuestDishes({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const t = getDictionary(lang);
  const items = menu.items.filter((i) => i.guest);
  return (
    <div className="container-x pt-24 md:pt-32">
      <header className="mb-10">
        <p className="kicker">{t.guest.kicker}</p>
        <h1 className="heading mt-2 text-6xl md:text-8xl">{t.guest.title}</h1>
        <p className="mt-3 max-w-2xl text-cream-muted">{t.guest.sub}</p>
      </header>
      {items.length === 0 && <p className="glass p-8 text-cream-muted">{t.guest.none}</p>}
      <div className="space-y-8">
        {items.map((item) => (
          <Reveal key={item.id}>
            <article className="glass grid overflow-hidden lg:grid-cols-2">
              <Photo src={item.image} alt={tr(item.name, lang)} className="min-h-[300px] w-full" sizes="(min-width: 1024px) 50vw, 100vw" priority />
              <div className="flex flex-col justify-center p-8 md:p-12">
                <h2 className="heading text-5xl md:text-6xl">{tr(item.name, lang)}</h2>
                <p className="mt-4 text-lg text-cream-muted">{tr(item.description, lang)}</p>
                <p className="mt-6 font-display text-4xl font-bold text-flame">{formatPrice(item.price, lang)}</p>
                <Link href={`/${lang}/menu?item=${item.id}`} className="btn-primary mt-8 self-start">
                  {t.common.orderNow} <Icon name="arrowRight" />
                </Link>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
