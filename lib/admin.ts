import "server-only";
import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "sfr_admin";

function token() {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  return createHash("sha256").update(`sfr-admin:${pw}`).digest("hex");
}

export function checkPassword(input: string) {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(pw);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function adminToken() {
  return token();
}

export async function isAdmin() {
  const t = token();
  if (!t) return false;
  const jar = await cookies();
  return jar.get(ADMIN_COOKIE)?.value === t;
}
