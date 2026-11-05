import type { Metadata, Viewport } from "next";
import { Fira_Sans_Extra_Condensed, Manrope } from "next/font/google";
import Script from "next/script";
import { notFound } from "next/navigation";
import { Motion } from "@/components/providers/Motion";
import "../globals.css";
import { CartDrawer } from "@/components/CartDrawer";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MobileBar } from "@/components/MobileBar";
import { CartProvider } from "@/components/providers/CartProvider";
import { I18nProvider } from "@/components/providers/I18nProvider";
import { getDictionary, isLocale, locales } from "@/lib/i18n";
import { JsonLd, restaurantSchema } from "@/lib/seo";
import { GTM_ID, SITE_URL } from "@/lib/site";

const display = Fira_Sans_Extra_Condensed({
  subsets: ["latin", "greek"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});
const body = Manrope({ subsets: ["latin", "greek"], variable: "--font-body", display: "swap" });

export const viewport: Viewport = {
  themeColor: "#0a0908",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const t = getDictionary(lang).meta;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t.homeTitle, template: "%s | Street Food Rey" },
    description: t.homeDesc,
    applicationName: "Street Food Rey",
    formatDetection: { telephone: true, address: true },
  };
}

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function RootLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <html lang={lang} className={`${display.variable} ${body.variable}`}>
      <head>
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
        <JsonLd data={restaurantSchema(lang)} />
      </head>
      <body className="min-h-screen">
        <noscript>
          <iframe src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`} height="0" width="0" style={{ display: "none", visibility: "hidden" }} title="gtm" />
        </noscript>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-flame focus:px-4 focus:py-2 focus:text-ink">
          Skip to content
        </a>
        <Motion>
          <I18nProvider lang={lang} dict={dict}>
            <CartProvider>
              <Header />
              <main id="main">{children}</main>
              <Footer lang={lang} />
              <MobileBar />
              <CartDrawer />
            </CartProvider>
          </I18nProvider>
        </Motion>
      </body>
    </html>
  );
}
