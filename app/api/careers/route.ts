import { NextResponse, type NextRequest } from "next/server";
import { storeSubmission } from "@/lib/review-store";
import { failsBotChecks, looksLikeSpam } from "@/lib/spam";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

const MAX = 10 * 1024 * 1024;
const TYPES: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export async function POST(req: NextRequest) {
  let fd: FormData;
  try {
    fd = await req.formData();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  if (failsBotChecks({ t: fd.get("t"), website: fd.get("website") }, 3000)) return NextResponse.json({ ok: true });

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(String(fd.get("data") ?? "{}"));
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const json = JSON.stringify(data);
  if (json.length > 20000) return NextResponse.json({ error: "too large" }, { status: 413 });
  if (!data.fullName || !data.phone || !data.consentPrivacy || !data.consentVerify) return NextResponse.json({ error: "required" }, { status: 422 });
  if (looksLikeSpam(`${data.experience ?? ""} ${data.why ?? ""} ${data.additional ?? ""}`)) return NextResponse.json({ error: "spam" }, { status: 422 });

  const ref = `JOB-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  let cvPath: string | null = null;
  const cv = fd.get("cv");
  if (cv && typeof cv !== "string" && cv.size > 0) {
    const ext = cv.name.split(".").pop()?.toLowerCase() ?? "";
    if (!TYPES[ext] || cv.size > MAX) return NextResponse.json({ error: "cv" }, { status: 422 });
    const sb = getSupabase();
    if (sb) {
      cvPath = `${ref}.${ext}`;
      const { error } = await sb.storage.from("cvs").upload(cvPath, Buffer.from(await cv.arrayBuffer()), { contentType: TYPES[ext] });
      if (error) {
        console.error(error);
        cvPath = null;
      }
    } else {
      cvPath = `[demo] ${cv.name} (${Math.round(cv.size / 1024)} KB, not stored)`;
    }
  }

  try {
    await storeSubmission("applications", { ...data, ref, cv: cvPath, lang: fd.get("lang"), received_at: new Date().toISOString() });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, ref });
}
