import data from "@/data/locations.json";
import type { L10n } from "./i18n";

export type OrderMode = "delivery" | "takeaway" | "dinein";
export const ORDER_MODES: OrderMode[] = ["delivery", "takeaway", "dinein"];

export type Interval = [string, string];
export type Location = {
  id: string;
  name: L10n;
  address: L10n;
  mapQuery: string;
  lat: number;
  lng: number;
  phone: string;
  modes: OrderMode[];
  seasonal?: boolean;
  seasonStart?: string;
  seasonEnd?: string;
  hours: Record<string, Interval[]>;
  image: string;
};

/** Manual override set by staff in /admin. */
export type StoreOverride = {
  mode: "auto" | "open" | "closed";
  /** Order types temporarily not accepted (e.g. delivery paused when busy). */
  paused?: OrderMode[];
};
export type Overrides = Record<string, StoreOverride>;

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

export function telHref(phone: string) {
  return `tel:${phone.replace(/\s+/g, "")}`;
}

// ---------- time helpers (Europe/Nicosia) ----------

const WEEK = 7 * 1440;

export function toMin(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

export function localParts(date: Date, tz = TZ) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    weekday: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const dow = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return {
    dow,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
    mmdd: `${get("month")}-${get("day")}`,
    ymd: `${get("year")}-${get("month")}-${get("day")}`,
  };
}

/** Convert a wall-clock time in the store's time zone to a Date. */
export function zonedDate(ymd: string, hhmm: string, tz = TZ) {
  const [y, mo, d] = ymd.split("-").map(Number);
  const [h, mi] = hhmm.split(":").map(Number);
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  const p = localParts(new Date(guess), tz);
  const [py, pm, pd] = p.ymd.split("-").map(Number);
  const asUtc = Date.UTC(py, pm - 1, pd, Math.floor(p.minutes / 60), p.minutes % 60);
  return new Date(guess - (asUtc - guess));
}

export function inSeason(loc: Location, mmdd: string) {
  if (!loc.seasonal || !loc.seasonStart || !loc.seasonEnd) return true;
  return loc.seasonStart <= loc.seasonEnd
    ? mmdd >= loc.seasonStart && mmdd <= loc.seasonEnd
    : mmdd >= loc.seasonStart || mmdd <= loc.seasonEnd;
}

type Span = { start: number; end: number; open: string; close: string; dow: number };

function weekSpans(loc: Location): Span[] {
  const spans: Span[] = [];
  for (let d = 0; d < 7; d++) {
    for (const [open, close] of loc.hours[String(d)] ?? []) {
      const s = d * 1440 + toMin(open);
      let e = d * 1440 + toMin(close);
      if (e <= s) e += 1440; // closes after midnight
      spans.push({ start: s, end: e, open, close, dow: d });
    }
  }
  return spans;
}

export type OpenStatus =
  | { state: "open"; closesAt: string | null; closingSoon: boolean; manual?: boolean }
  | { state: "closed"; nextOpen: { daysAhead: number; dow: number; time: string } | null; manual?: boolean }
  | { state: "season"; seasonStart: string };

/** Status from the opening hours only. */
export function scheduleStatus(loc: Location, now = new Date()): OpenStatus {
  const { dow, minutes, mmdd } = localParts(now);
  if (!inSeason(loc, mmdd)) return { state: "season", seasonStart: loc.seasonStart ?? "" };
  const nowW = dow * 1440 + minutes;
  const spans = weekSpans(loc);
  for (const sp of spans) {
    for (const shift of [0, -WEEK]) {
      if (nowW >= sp.start + shift && nowW < sp.end + shift) {
        return { state: "open", closesAt: sp.close, closingSoon: sp.end + shift - nowW <= 45 };
      }
    }
  }
  return { state: "closed", nextOpen: nextOpening(spans, nowW, dow) };
}

function nextOpening(spans: Span[], nowW: number, dow: number) {
  let best: { diff: number; sp: Span } | null = null;
  for (const sp of spans) {
    let diff = sp.start - nowW;
    if (diff <= 0) diff += WEEK;
    if (!best || diff < best.diff) best = { diff, sp };
  }
  if (!best) return null;
  const daysAhead = (best.sp.dow - dow + 7) % 7;
  return { daysAhead: daysAhead === 0 && best.diff > 1440 ? 7 : daysAhead, dow: best.sp.dow, time: best.sp.open };
}

/** Status after applying the staff override. */
export function getOpenStatus(loc: Location, now = new Date(), override?: StoreOverride): OpenStatus {
  const base = scheduleStatus(loc, now);
  if (!override || override.mode === "auto") return base;
  if (override.mode === "open") {
    return { state: "open", closesAt: base.state === "open" ? base.closesAt : null, closingSoon: false, manual: true };
  }
  const { dow, minutes } = localParts(now);
  return { state: "closed", nextOpen: base.state === "closed" ? base.nextOpen : nextOpening(weekSpans(loc), dow * 1440 + minutes + 1, dow), manual: true };
}

/** Order types a store accepts right now (ignoring open/closed). */
export function activeModes(loc: Location, override?: StoreOverride): OrderMode[] {
  return loc.modes.filter((m) => !override?.paused?.includes(m));
}

export type Slot = { iso: string; ymd: string; time: string };

/**
 * Pickup / delivery time slots inside opening hours for the next `days` days,
 * every `step` minutes, starting `leadMin` minutes from now.
 */
export function scheduleSlots(loc: Location, now = new Date(), days = 7, step = 15, leadMin = 30): Slot[] {
  const slots: Slot[] = [];
  const earliest = now.getTime() + leadMin * 60000;
  for (let i = 0; i < days; i++) {
    const day = new Date(now.getTime() + i * 86400000);
    const { dow, ymd, mmdd } = localParts(day);
    if (!inSeason(loc, mmdd)) continue;
    for (const [open, close] of loc.hours[String(dow)] ?? []) {
      let s = toMin(open);
      let e = toMin(close);
      if (e <= s) e += 1440;
      // first slot 15 min after opening, last slot 15 min before closing
      for (let m = s + step; m <= e - step; m += step) {
        const mm = m % 1440;
        const time = `${String(Math.floor(mm / 60)).padStart(2, "0")}:${String(mm % 60).padStart(2, "0")}`;
        const date = zonedDate(ymd, time);
        if (m >= 1440) date.setTime(date.getTime() + 86400000);
        if (date.getTime() < earliest) continue;
        slots.push({ iso: date.toISOString(), ymd: localParts(date).ymd, time });
      }
    }
  }
  return slots;
}
