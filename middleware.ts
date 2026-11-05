import { NextResponse, type NextRequest } from "next/server";

const LOCALES = ["el", "en"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) return;

  const accept = req.headers.get("accept-language")?.toLowerCase() ?? "";
  const prefersEn = accept && !accept.startsWith("el") && !/\bel\b/.test(accept.split(",")[0]);
  const cookie = req.cookies.get("lang")?.value;
  const lang = cookie && LOCALES.includes(cookie) ? cookie : prefersEn ? "en" : "el";

  const url = req.nextUrl.clone();
  url.pathname = `/${lang}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next|images|favicon.ico|icon|apple-icon|robots.txt|sitemap.xml|opengraph-image|.*\\..*).*)"],
};
