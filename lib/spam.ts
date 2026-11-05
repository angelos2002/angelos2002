import "server-only";

/** Basic spam heuristics shared by all public forms. */
export function looksLikeSpam(text: string) {
  const links = (text.match(/https?:\/\/|www\.|\.(com|ru|xyz|top|info)\b/gi) ?? []).length;
  if (links > 0) return true;
  if (/(.)\1{9,}/.test(text)) return true; // aaaaaaaaaa
  if (/\b(viagra|casino|crypto|bitcoin|loan|seo services|backlinks)\b/i.test(text)) return true;
  return false;
}

/** Honeypot + minimum fill time check. `t` is the client timestamp when the form was rendered. */
export function failsBotChecks(body: { website?: unknown; t?: unknown }, minMs = 3000) {
  if (typeof body.website === "string" && body.website.trim() !== "") return true;
  const t = Number(body.t);
  if (!Number.isFinite(t) || Date.now() - t < minMs || Date.now() - t > 1000 * 60 * 60 * 6) return true;
  return false;
}

export function clientIp(headers: Headers) {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown";
}
