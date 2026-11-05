"use client";

import { useState } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import { useStoreOverrides } from "@/components/providers/StoreStatusProvider";
import { OpenBadge } from "@/components/ui/OpenBadge";
import { tr } from "@/lib/i18n";
import { locations, type OrderMode, type Overrides, type StoreOverride } from "@/lib/locations";

export function AdminStores({ initial }: { initial: Overrides }) {
  const { lang, t } = useI18n();
  const a = t.admin;
  const { refresh } = useStoreOverrides();
  const [ov, setOv] = useState<Overrides>(initial);
  const [saving, setSaving] = useState("");

  const save = async (id: string, next: StoreOverride) => {
    setSaving(id);
    setOv((o) => ({ ...o, [id]: next }));
    const res = await fetch("/api/store-status", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, ...next }) });
    if (res.ok) setOv((await res.json()).overrides);
    refresh();
    setSaving("");
  };

  return (
    <section className="mb-14" aria-labelledby="stores-h">
      <h2 id="stores-h" className="heading mb-2 text-3xl">{a.storesTitle}</h2>
      <p className="mb-5 text-sm text-cream-dim">{a.storesHelp}</p>
      <div className="grid gap-4 lg:grid-cols-3">
        {locations.map((l) => {
          const cur: StoreOverride = ov[l.id] ?? { mode: "auto", paused: [] };
          return (
            <div key={l.id} className="glass p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="heading text-2xl">{tr(l.name, lang)}</h3>
                {saving === l.id && <span className="text-xs text-cream-dim">…</span>}
              </div>
              <OpenBadge locationId={l.id} className="mt-2" />
              <p className="label mt-4">{a.status}</p>
              <div className="flex flex-wrap gap-2">
                {(["auto", "open", "closed"] as const).map((m) => (
                  <button key={m} type="button" onClick={() => save(l.id, { ...cur, mode: m })} className={`chip ${cur.mode === m ? "chip-active" : ""}`}>
                    {a[m]}
                  </button>
                ))}
              </div>
              <p className="label mt-4">{a.pause}</p>
              <div className="flex flex-wrap gap-2">
                {l.modes.map((m: OrderMode) => {
                  const paused = cur.paused?.includes(m);
                  return (
                    <button
                      key={m}
                      type="button"
                      aria-pressed={paused}
                      onClick={() => save(l.id, { ...cur, paused: paused ? (cur.paused ?? []).filter((x) => x !== m) : [...(cur.paused ?? []), m] })}
                      className={`chip ${paused ? "border-red-400/60 bg-red-500/10 text-red-200" : ""}`}
                    >
                      {t.checkout[m]}{paused ? ` · ${a.paused}` : ""}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
