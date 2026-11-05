import "server-only";
import { createHash, randomUUID } from "crypto";
import { getSupabase } from "./supabase";
import type { Review, ReviewSummary } from "./reviews";

/**
 * Review storage. Uses Supabase when configured, otherwise an in-memory demo
 * store (resets on server restart) so the site works out of the box.
 */

type Row = Review & { ip_hash?: string };

const g = globalThis as unknown as { __sfrReviews?: Row[] };
function demo(): Row[] {
  if (!g.__sfrReviews) {
    const now = Date.now();
    const seed: [string, number, string, string][] = [
      ["zakaki", 5, "Andreas K.", "Best smash burger in Limassol, hands down. The Rey sauce is addictive."],
      ["zakaki", 5, "Maria P.", "Τέλειο Smoke King και πολύ γρήγορο delivery. Θα ξαναπαραγγείλω σίγουρα!"],
      ["zakaki", 4, "James W.", "Great burgers, fries were crispy. Gets busy on Fridays."],
      ["leontiou", 5, "Elena S.", "Το Wagyu Truffle αξίζει κάθε ευρώ. Φανταστικό προσωπικό."],
      ["leontiou", 5, "Nikos D.", "Juicy patties, soft brioche, quick service. My go-to."],
      ["leontiou", 4, "Sophie L.", "Loved the crispy chicken. Milkshake was huge."],
      ["guaba", 5, "Chris M.", "Burgers on the beach with a sunset. Doesn't get better."],
      ["guaba", 5, "Κατερίνα Α.", "Το καλύτερο φαγητό σε beach bar. Ζουμερό και γευστικό!"],
    ];
    g.__sfrReviews = seed.map(([location, rating, name, comment], i) => ({
      id: randomUUID(),
      location,
      rating,
      name,
      comment,
      created_at: new Date(now - (i + 1) * 86400000 * 3).toISOString(),
      hidden: false,
    }));
  }
  return g.__sfrReviews;
}

export const isDemo = () => !getSupabase();

export function hashIp(ip: string) {
  return createHash("sha256").update(`${process.env.REVIEW_IP_SALT || "sfr"}:${ip}`).digest("hex");
}

export async function getSummary(location: string, limit = 6): Promise<ReviewSummary> {
  const sb = getSupabase();
  if (!sb) {
    const rows = demo().filter((r) => r.location === location && !r.hidden);
    return summarize(rows, limit);
  }
  const [{ data: ratings }, { data: latest }] = await Promise.all([
    sb.from("reviews").select("rating").eq("location", location).eq("hidden", false),
    sb
      .from("reviews")
      .select("id, location, rating, name, comment, created_at")
      .eq("location", location)
      .eq("hidden", false)
      .order("created_at", { ascending: false })
      .limit(limit),
  ]);
  const list = ratings ?? [];
  const avg = list.length ? list.reduce((s, r) => s + r.rating, 0) / list.length : 0;
  return { average: Math.round(avg * 10) / 10, count: list.length, reviews: (latest as Review[]) ?? [] };
}

function summarize(rows: Row[], limit: number): ReviewSummary {
  const avg = rows.length ? rows.reduce((s, r) => s + r.rating, 0) / rows.length : 0;
  const sorted = [...rows].sort((a, b) => b.created_at.localeCompare(a.created_at));
  return {
    average: Math.round(avg * 10) / 10,
    count: rows.length,
    reviews: sorted.slice(0, limit).map(({ ip_hash: _ip, ...r }) => r),
  };
}

export async function getLatestAll(limit = 12): Promise<Review[]> {
  const sb = getSupabase();
  if (!sb) {
    return demo()
      .filter((r) => !r.hidden && r.rating >= 4)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, limit)
      .map(({ ip_hash: _ip, ...r }) => r);
  }
  const { data } = await sb
    .from("reviews")
    .select("id, location, rating, name, comment, created_at")
    .eq("hidden", false)
    .gte("rating", 4)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as Review[]) ?? [];
}

export async function countRecentByIp(ipHash: string, sinceMs: number): Promise<number> {
  const since = new Date(Date.now() - sinceMs).toISOString();
  const sb = getSupabase();
  if (!sb) return demo().filter((r) => r.ip_hash === ipHash && r.created_at >= since).length;
  const { count } = await sb
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", since);
  return count ?? 0;
}

export async function insertReview(r: Omit<Row, "id" | "created_at" | "hidden">): Promise<Review> {
  const sb = getSupabase();
  if (!sb) {
    const row: Row = { ...r, id: randomUUID(), created_at: new Date().toISOString(), hidden: false };
    demo().push(row);
    const { ip_hash: _ip, ...pub } = row;
    return pub;
  }
  const { data, error } = await sb
    .from("reviews")
    .insert(r)
    .select("id, location, rating, name, comment, created_at")
    .single();
  if (error) throw error;
  return data as Review;
}

export async function listAll(): Promise<Review[]> {
  const sb = getSupabase();
  if (!sb) {
    return [...demo()].sort((a, b) => b.created_at.localeCompare(a.created_at)).map(({ ip_hash: _ip, ...r }) => r);
  }
  const { data } = await sb
    .from("reviews")
    .select("id, location, rating, name, comment, created_at, hidden")
    .order("created_at", { ascending: false })
    .limit(500);
  return (data as Review[]) ?? [];
}

export async function setHidden(id: string, hidden: boolean) {
  const sb = getSupabase();
  if (!sb) {
    const row = demo().find((r) => r.id === id);
    if (row) row.hidden = hidden;
    return;
  }
  const { error } = await sb.from("reviews").update({ hidden }).eq("id", id);
  if (error) throw error;
}

/** Store a generic form submission (catering enquiry, job application, order). */
export async function storeSubmission(table: "enquiries" | "applications" | "orders", payload: Record<string, unknown>) {
  const sb = getSupabase();
  if (!sb) {
    console.info(`[demo] ${table} submission`, JSON.stringify(payload));
    return;
  }
  const { error } = await sb.from(table).insert({ payload });
  if (error) throw error;
}
