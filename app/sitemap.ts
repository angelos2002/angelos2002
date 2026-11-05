import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";

const pages = ["", "/menu", "/locations", "/reviews", "/catering", "/about", "/careers"];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.flatMap((p) =>
    locales.map((l) => ({
      url: `${SITE_URL}/${l}${p}`,
      changeFrequency: p === "/menu" ? "weekly" : "monthly",
      priority: p === "" ? 1 : p === "/menu" ? 0.9 : 0.7,
      alternates: { languages: Object.fromEntries(locales.map((x) => [x, `${SITE_URL}/${x}${p}`])) },
    })),
  );
}
