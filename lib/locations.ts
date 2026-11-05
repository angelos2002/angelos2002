import data from "@/data/locations.json";
import type { L10n } from "./i18n";

export type Interval = [string, string];
export type Location = {
  id: string;
  name: L10n;
  address: L10n;
  mapQuery: string;
  lat: number;
  lng: number;
  phone: string;
  delivery: boolean;
  seasonal?: boolean;
  seasonStart?: string;
  seasonEnd?: string;
  hours: Record<string, Interval[]>;
  image: string;
};

export const locations = data.locations as unknown as Location[];
export const TZ = data.timezone;

export function getLocation(id: string) {
  return locations.find((l) => l.id === id);
}

export function directionsUrl(loc: Location) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(loc.mapQuery)}`;
}

export function mapEmbedUrl(loc: Location) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(loc.mapQuery)}&z=16&output=embed`;
}

// ---------- open / closed logic ----------

const WEEK = 7 * 1440;

function toMin(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

function localParts(date: Date, tz = TZ) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const dow = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { dow, minutes: Number(get("hour")) * 60 + Number(get("minute")), mmdd: `${get("month")}-${get("day")}` };
}

export function inSeason(loc: Location, mmdd: string) {
  if (!loc.seasonal || !loc.seasonStart || !loc.seasonEnd) return true;
  return loc.seasonStart <= loc.seasonEnd
    ? mmdd >= loc.seasonStart && mmdd <= loc.seasonEnd
    : mmdd >= loc.seasonStart || mmdd <= loc.seasonEnd;
}

export type OpenStatus =
  | { state: "open"; closesAt: string; closingSoon: boolean }
  | { state: "closed"; nextOpen: { daysAhead: number; dow: number; time: string } | null }
  | { state: "season"; seasonStart: string };

export function getOpenStatus(loc: Location, now = new Date()): OpenStatus {
  const { dow, minutes, mmdd } = localParts(now);
  if (!inSeason(loc, mmdd)) return { state: "season", seasonStart: loc.seasonStart ?? "" };

  const nowW = dow * 1440 + minutes;
  type Span = { start: number; end: number; open: string; close: string; dow: number };
  const spans: Span[] = [];
  for (let d = 0; d < 7; d++) {
    for (const [open, close] of loc.hours[String(d)] ?? []) {
      const s = d * 1440 + toMin(open);
      let e = d * 1440 + toMin(close);
      if (e <= s) e += 1440; // closes after midnight
      spans.push({ start: s, end: e, open, close, dow: d });
    }
  }
  for (const sp of spans) {
    for (const shift of [0, -WEEK]) {
      const s = sp.start + shift;
      const e = sp.end + shift;
      if (nowW >= s && nowW < e) {
        return { state: "open", closesAt: sp.close, closingSoon: e - nowW <= 45 };
      }
    }
  }
  let best: { diff: number; sp: Span } | null = null;
  for (const sp of spans) {
    let diff = sp.start - nowW;
    if (diff <= 0) diff += WEEK;
    if (!best || diff < best.diff) best = { diff, sp };
  }
  if (!best) return { state: "closed", nextOpen: null };
  const daysAhead = (best.sp.dow - dow + 7) % 7;
  return { state: "closed", nextOpen: { daysAhead: daysAhead === 0 && best.diff > 1440 ? 7 : daysAhead, dow: best.sp.dow, time: best.sp.open } };
}
