"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import type { Location } from "@/lib/locations";
import { TZ } from "@/lib/locations";

const ORDER = [1, 2, 3, 4, 5, 6, 0];

export function HoursTable({ loc }: { loc: Location }) {
  const { t } = useI18n();
  const [today, setToday] = useState<number | null>(null);
  useEffect(() => {
    const wd = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, weekday: "short" }).format(new Date());
    setToday(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(wd));
  }, []);
  return (
    <table className="w-full text-sm">
      <caption className="sr-only">{t.locations.hours}</caption>
      <tbody>
        {ORDER.map((d) => {
          const spans = loc.hours[String(d)] ?? [];
          const isToday = today === d;
          return (
            <tr key={d} className={`border-b border-black/5 last:border-0 ${isToday ? "text-cream" : "text-cream-muted"}`}>
              <th scope="row" className={`py-2 text-left font-medium ${isToday ? "text-flame" : ""}`}>
                {t.locations.days[d]}
                {isToday && <span className="ml-2 rounded-full bg-flame/15 px-2 py-0.5 text-[10px] uppercase">{t.common.today}</span>}
              </th>
              <td className="py-2 text-right tabular-nums">{spans.length ? spans.map(([a, b]) => `${a} – ${b}`).join(", ") : t.common.closed}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
