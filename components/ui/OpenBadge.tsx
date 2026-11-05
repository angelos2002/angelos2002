"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import { fmt } from "@/lib/i18n";
import { getLocation, getOpenStatus, type OpenStatus } from "@/lib/locations";

export function useOpenStatus(locationId: string) {
  const [status, setStatus] = useState<OpenStatus | null>(null);
  useEffect(() => {
    const loc = getLocation(locationId);
    if (!loc) return;
    const tick = () => setStatus(getOpenStatus(loc));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [locationId]);
  return status;
}

export function OpenBadge({ locationId, className = "" }: { locationId: string; className?: string }) {
  const { t } = useI18n();
  const status = useOpenStatus(locationId);

  let tone = "bg-white/5 text-cream-dim border-white/10";
  let dot = "bg-cream-dim";
  let label = " ";
  let sub = "";

  if (status?.state === "open") {
    tone = status.closingSoon ? "bg-ember/10 text-ember border-ember/30" : "bg-emerald-400/10 text-emerald-300 border-emerald-400/30";
    dot = status.closingSoon ? "bg-ember" : "bg-emerald-400";
    label = status.closingSoon ? t.common.closingSoon : t.common.openNow;
    sub = fmt(t.common.closesAt, { time: status.closesAt });
  } else if (status?.state === "closed") {
    tone = "bg-flame/10 text-flame-300 border-flame/30";
    dot = "bg-flame";
    label = t.common.closed;
    const n = status.nextOpen;
    if (n) {
      sub =
        n.daysAhead === 0
          ? fmt(t.common.opensAt, { time: n.time })
          : fmt(t.common.opensDayAt, { day: n.daysAhead === 1 ? t.common.tomorrow : t.locations.days[n.dow], time: n.time });
    }
  } else if (status?.state === "season") {
    label = t.common.outOfSeason;
    const [m, d] = status.seasonStart.split("-");
    sub = fmt(t.common.seasonOpens, { date: `${d}/${m}` });
  }

  return (
    <span
      className={`inline-flex min-h-[30px] items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${tone} ${className}`}
      aria-live="polite"
    >
      <span className={`h-2 w-2 rounded-full ${dot} ${status?.state === "open" ? "animate-pulse-dot shadow-[0_0_8px_currentColor]" : ""}`} />
      <span>{label}</span>
      {sub && <span className="font-normal opacity-80">· {sub}</span>}
    </span>
  );
}
