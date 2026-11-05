import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin";
import { setHidden } from "@/lib/review-store";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const { hidden } = await req.json().catch(() => ({}));
  if (typeof hidden !== "boolean") return NextResponse.json({ error: "invalid" }, { status: 400 });
  await setHidden(id, hidden);
  return NextResponse.json({ ok: true });
}
