import { NextResponse, type NextRequest } from "next/server";
import { locations } from "@/lib/locations";
import { countRecentByIp, getSummary, hashIp, insertReview } from "@/lib/review-store";
import { clientIp, failsBotChecks, looksLikeSpam } from "@/lib/spam";

export const dynamic = "force-dynamic";

const validLocation = (id: unknown): id is string => typeof id === "string" && locations.some((l) => l.id === id);

export async function GET(req: NextRequest) {
  const location = req.nextUrl.searchParams.get("location");
  if (!validLocation(location)) return NextResponse.json({ error: "location" }, { status: 400 });
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit")) || 6, 50);
  return NextResponse.json(await getSummary(location, limit));
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  // Bots: pretend success so they don't retry.
  if (failsBotChecks(body)) return NextResponse.json({ ok: true, ignored: true });

  const location = body.location;
  const rating = Number(body.rating);
  const name = String(body.name ?? "").trim().slice(0, 60);
  const comment = String(body.comment ?? "").trim().slice(0, 1000);

  if (!validLocation(location)) return NextResponse.json({ error: "location" }, { status: 400 });
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return NextResponse.json({ error: "rating" }, { status: 400 });
  if (name.length < 1) return NextResponse.json({ error: "name" }, { status: 400 });
  if (comment.length < 10) return NextResponse.json({ error: "comment" }, { status: 400 });
  if (looksLikeSpam(`${name} ${comment}`)) return NextResponse.json({ error: "spam" }, { status: 422 });

  const ip_hash = hashIp(clientIp(req.headers));
  if ((await countRecentByIp(ip_hash, 60 * 60 * 1000)) >= 3) {
    return NextResponse.json({ error: "rate" }, { status: 429 });
  }

  try {
    const review = await insertReview({ location, rating, name, comment, ip_hash });
    return NextResponse.json({ ok: true, review });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
