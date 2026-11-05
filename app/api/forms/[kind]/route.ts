import { NextResponse, type NextRequest } from "next/server";
import { storeSubmission } from "@/lib/review-store";
import { failsBotChecks, looksLikeSpam } from "@/lib/spam";

const TABLES = { catering: "enquiries", careers: "applications", order: "orders" } as const;
type Kind = keyof typeof TABLES;

export async function POST(req: NextRequest, { params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  if (!(kind in TABLES)) return NextResponse.json({ error: "not found" }, { status: 404 });
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "invalid" }, { status: 400 });
  if (failsBotChecks(body, 2000)) return NextResponse.json({ ok: true, ignored: true });

  const { website: _w, t: _t, ...data } = body as Record<string, unknown>;
  const json = JSON.stringify(data);
  if (json.length > 20000) return NextResponse.json({ error: "too large" }, { status: 413 });
  if (kind !== "order" && looksLikeSpam(String(data.message ?? data.experience ?? ""))) {
    return NextResponse.json({ error: "spam" }, { status: 422 });
  }
  const ref = `SFR-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  try {
    await storeSubmission(TABLES[kind as Kind], { ...data, ref, received_at: new Date().toISOString() });
    return NextResponse.json({ ok: true, ref });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
