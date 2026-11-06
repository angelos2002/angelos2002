import type { Metadata } from "next";
import { getDictionary, locales, tr, type Locale } from "./i18n";
import { locations } from "./locations";
import { PHONE, SITE_URL, SOCIAL } from "./site";

type PageKey = "home" | "menu" | "checkout" | "locations" | "reviews" | "catering" | "about" | "careers" | "guest" | "privacy";

const PATHS: Record<PageKey, string> = {
  home: "",
  menu: "/menu",
  checkout: "/checkout",
  locations: "/locations",
  reviews: "/reviews",
  catering: "/catering",
  about: "/about",
  careers: "/careers",
  guest: "/guest-dishes",
  privacy: "/privacy",
};

export function pageMetadata(lang: Locale, page: PageKey, opts: { noindex?: boolean } = {}): Metadata {
  const t = getDictionary(lang).meta;
  const title = page === "home" ? t.homeTitle : (t[`${page}Title` as keyof typeof t] as string);
  const description = (page === "home" ? t.homeDesc : t[`${page}Desc` as keyof typeof t]) as string;
  const path = PATHS[page];
  const url = `${SITE_URL}/${lang}${path}`;
  return {
    title: page === "home" ? { absolute: title } : title,
    description,
    alternates: {
      canonical: url,
      languages: { ...Object.fromEntries(locales.map((l) => [l === "el" ? "el-CY" : "en", `${SITE_URL}/${l}${path}`])), "x-default": `${SITE_URL}/el${path}` },
    },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: "Street Food Rey",
      locale: lang === "el" ? "el_CY" : "en_CY",
      alternateLocale: lang === "el" ? ["en_CY"] : ["el_CY"],
    },
    twitter: { card: "summary_large_image", title, description },
    robots: opts.noindex ? { index: false, follow: false } : undefined,
  };
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** schema.org Restaurant graph — one entry per location under a parent Organization. */
export function restaurantSchema(lang: Locale) {
  const org = {
    "@type": "Organization",
    "@id": `${SITE_URL}/#org`,
    name: "Street Food Rey",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    telephone: PHONE,
    sameAs: [SOCIAL.instagram, SOCIAL.facebook],
  };
  const restaurants = locations.map((l) => ({
    "@type": "Restaurant",
    "@id": `${SITE_URL}/#${l.id}`,
    name: `Street Food Rey — ${tr(l.name, "en")}`,
    parentOrganization: { "@id": `${SITE_URL}/#org` },
    image: l.image,
    url: `${SITE_URL}/${lang}/locations#${l.id}`,
    telephone: l.phone,
    servesCuisine: ["Burgers", "American", "Street food"],
    priceRange: "€€",
    acceptsReservations: false,
    hasMenu: `${SITE_URL}/${lang}/menu`,
    address: {
      "@type": "PostalAddress",
      streetAddress: tr(l.address, "en").split(",")[0],
      addressLocality: "Limassol",
      addressCountry: "CY",
    },
    geo: { "@type": "GeoCoordinates", latitude: l.lat, longitude: l.lng },
    openingHoursSpecification: Object.entries(l.hours).flatMap(([d, spans]) =>
      spans.map(([opens, closes]) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: `https://schema.org/${DAY_NAMES[Number(d)]}`,
        opens,
        closes,
        ...(l.seasonal && l.seasonStart && l.seasonEnd
          ? { validFrom: `${new Date().getFullYear()}-${l.seasonStart}`, validThrough: `${new Date().getFullYear()}-${l.seasonEnd}` }
          : {}),
      })),
    ),
    potentialAction: l.modes.includes("delivery")
      ? { "@type": "OrderAction", target: `${SITE_URL}/${lang}/menu`, deliveryMethod: ["http://purl.org/goodrelations/v1#DeliveryModeOwnFleet", "http://purl.org/goodrelations/v1#DeliveryModePickUp"] }
      : undefined,
  }));
  return { "@context": "https://schema.org", "@graph": [org, ...restaurants] };
}

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
