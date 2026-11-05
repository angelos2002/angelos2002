import { NextResponse, type NextRequest } from "next/server";
import { applyPromo } from "@/lib/promos";
import { ORDER_MODES, type OrderMode } from "@/lib/locations";

export async function POST(req: NextRequest) {
  const { code, subtotal, mode, location } = await req.json().catch(() => ({}));
  if (typeof code !== "string" || !ORDER_MODES.includes(mode as OrderMode)) return NextResponse.json({ ok: false, reason: "invalid" });
  return NextResponse.json(applyPromo(code, Number(subtotal) || 0, mode, String(location)));
}
