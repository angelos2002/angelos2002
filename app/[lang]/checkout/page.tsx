import { Checkout } from "@/components/Checkout";
import { getDictionary, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  return pageMetadata(lang, "checkout", { noindex: true });
}

export default async function CheckoutPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const t = getDictionary(lang);
  return (
    <div className="container-x pb-[calc(var(--mobile-bar)+2rem)] pt-24 md:pt-32">
      <h1 className="heading mb-8 text-6xl md:text-7xl">{t.checkout.title}</h1>
      <Checkout />
    </div>
  );
}
