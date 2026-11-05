import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin";
import { getOverrides, sanitizeOverride, setOverride } from "@/lib/store-status";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ overrides: await getOverrides() }, { headers: { "cache-control": "no-store" } });
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const o = sanitizeOverride(body);
  if (typeof body.id !== "string" || !o) return NextResponse.json({ error: "invalid" }, { status: 400 });
  try {
    await setOverride(body.id, o);
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  return NextResponse.json({ ok: true, overrides: await getOverrides() });
}
