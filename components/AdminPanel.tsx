"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import { Stars } from "@/components/ui/Stars";
import { tr } from "@/lib/i18n";
import { getLocation } from "@/lib/locations";
import type { Review } from "@/lib/reviews";

export function AdminLogin() {
  const { t } = useI18n();
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  return (
    <form
      className="glass mx-auto max-w-sm space-y-4 p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        const res = await fetch("/api/admin", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password: pw }) });
        if (res.ok) router.refresh();
        else setErr(true);
      }}
    >
      <label htmlFor="pw" className="label">{t.admin.password}</label>
      <input id="pw" type="password" className="field" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" />
      {err && <p className="text-sm text-red-300">{t.admin.wrong}</p>}
      <button className="btn-primary w-full" type="submit">{t.admin.login}</button>
    </form>
  );
}

export function AdminReviews({ initial }: { initial: Review[] }) {
  const { lang, t } = useI18n();
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [filter, setFilter] = useState("all");

  const toggle = async (r: Review) => {
    const hidden = !r.hidden;
    setRows((x) => x.map((y) => (y.id === r.id ? { ...y, hidden } : y)));
    const res = await fetch(`/api/reviews/${r.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ hidden }) });
    if (!res.ok) setRows((x) => x.map((y) => (y.id === r.id ? { ...y, hidden: !hidden } : y)));
  };

  const shown = rows.filter((r) => filter === "all" || r.location === filter);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {["all", "zakaki", "leontiou", "guaba"].map((f) => (
            <button key={f} type="button" onClick={() => setFilter(f)} className={`chip ${filter === f ? "chip-active" : ""}`}>
              {f === "all" ? "All" : tr(getLocation(f)!.name, lang)}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="btn-ghost py-2 text-sm"
          onClick={async () => {
            await fetch("/api/admin", { method: "DELETE" });
            router.refresh();
          }}
        >
          {t.admin.logout}
        </button>
      </div>
      <ul className="space-y-3">
        {shown.map((r) => (
          <li key={r.id} className={`glass flex flex-col gap-3 p-4 sm:flex-row sm:items-start ${r.hidden ? "opacity-50" : ""}`}>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <Stars value={r.rating} />
                <span className="font-semibold">{r.name}</span>
                <span className="text-cream-dim">{tr(getLocation(r.location)?.name ?? { el: r.location, en: r.location }, lang)}</span>
                <span className="text-cream-dim">{new Date(r.created_at).toLocaleString()}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs ${r.hidden ? "bg-red-500/15 text-red-300" : "bg-emerald-400/15 text-emerald-300"}`}>
                  {r.hidden ? t.admin.hidden : t.admin.visible}
                </span>
              </div>
              <p className="mt-2 text-cream-muted">{r.comment}</p>
            </div>
            <button type="button" onClick={() => toggle(r)} className={r.hidden ? "btn-primary py-2 text-sm" : "btn-ghost py-2 text-sm"}>
              {r.hidden ? t.admin.unhide : t.admin.hide}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
