import { NextResponse, type NextRequest } from "next/server";
import { priceOrder, type OrderInput } from "@/lib/order";
import { storeSubmission } from "@/lib/review-store";
import { failsBotChecks } from "@/lib/spam";
import { getOverrides } from "@/lib/store-status";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "invalid" }, { status: 400 });
  if (failsBotChecks(body, 2000)) return NextResponse.json({ ok: true, ref: "SFR-000000" });

  const overrides = await getOverrides();
  const priced = priceOrder(body as OrderInput, overrides[body.location]);
  if ("error" in priced) return NextResponse.json({ error: priced.error }, { status: 422 });

  const c = body.customer ?? {};
  const customer = {
    name: String(c.name ?? "").trim().slice(0, 80),
    phone: String(c.phone ?? "").trim().slice(0, 30),
    email: String(c.email ?? "").trim().slice(0, 120),
    address: String(c.address ?? "").trim().slice(0, 300),
    table: String(c.table ?? "").trim().slice(0, 20),
    notes: String(c.notes ?? "").trim().slice(0, 500),
  };
  if (customer.name.length < 2 || customer.phone.replace(/\D/g, "").length < 7) return NextResponse.json({ error: "details" }, { status: 422 });
  if (body.mode === "delivery" && customer.address.length < 5) return NextResponse.json({ error: "details" }, { status: 422 });

  const ref = `SFR-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  try {
    await storeSubmission("orders", {
      ref,
      lang: body.lang,
      mode: body.mode,
      location: body.location,
      when: body.when,
      customer,
      ...priced,
      payment: "pay_on_delivery_or_pickup",
      received_at: new Date().toISOString(),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, ref, total: priced.total });
}
