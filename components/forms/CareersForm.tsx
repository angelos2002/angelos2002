"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import { Icon } from "@/components/ui/Icon";
import { fmt, tr } from "@/lib/i18n";
import { locations } from "@/lib/locations";
import { Field } from "./Field";
import { Progress } from "./Progress";
import { useFormGuard } from "./useFormGuard";

type Data = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  role: string;
  location: string;
  type: string;
  startDate: string;
  days: number[];
  years: string;
  experience: string;
  languages: string;
  why: string;
  consent: boolean;
};

const EMPTY: Data = {
  firstName: "", lastName: "", email: "", phone: "", city: "",
  role: "", location: "any", type: "", startDate: "", days: [],
  years: "", experience: "", languages: "", why: "", consent: false,
};

export function CareersForm() {
  const { lang, t } = useI18n();
  const c = t.careers;
  const { field: honeypot, guard } = useFormGuard();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [d, setD] = useState<Data>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Data, string>>>({});
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const total = c.steps.length;

  const set = <K extends keyof Data>(k: K, v: Data[K]) => setD((x) => ({ ...x, [k]: v }));
  const inp = (k: keyof Data) => ({
    value: d[k] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => set(k, e.target.value as never),
  });

  const validate = (s: number) => {
    const e: typeof errors = {};
    const req = t.common.required;
    if (s === 0) {
      if (!d.firstName.trim()) e.firstName = req;
      if (!d.lastName.trim()) e.lastName = req;
      if (!/^\S+@\S+\.\S+$/.test(d.email)) e.email = req;
      if (d.phone.replace(/\D/g, "").length < 7) e.phone = req;
    }
    if (s === 1) {
      if (!d.role) e.role = req;
      if (!d.type) e.type = req;
    }
    if (s === 2 && d.days.length === 0) e.days = req;
    if (s === 3 && d.experience.trim().length < 3) e.experience = req;
    if (s === 4 && !d.consent) e.consent = req;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const go = (delta: 1 | -1) => {
    if (delta === 1 && !validate(step)) return;
    setDir(delta);
    setStep((s) => Math.max(0, Math.min(total - 1, s + delta)));
    document.getElementById("apply")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const submit = async () => {
    if (!validate(4)) return;
    setState("sending");
    try {
      const res = await fetch("/api/forms/careers", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...d, ...guard(), lang }),
      });
      setState(res.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  };

  if (state === "sent") {
    return (
      <div className="glass p-10 text-center" role="status">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-flame text-ink shadow-glow">
          <Icon name="check" className="h-7 w-7" />
        </span>
        <p className="mt-5 text-lg">{c.sent}</p>
      </div>
    );
  }

  const choice = (active: boolean) => `chip cursor-pointer ${active ? "chip-active" : ""}`;
  const locName = d.location === "any" ? c.anyLocation : tr(locations.find((l) => l.id === d.location)!.name, lang);

  return (
    <div id="apply" className="glass relative scroll-mt-28 p-5 md:p-8">
      {honeypot}
      <Progress steps={c.steps} current={step} label={fmt(c.stepOf, { n: step + 1, total })} />
      <div className="relative mt-8 overflow-hidden">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            initial={{ opacity: 0, x: dir * 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -30 }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="heading mb-6 text-3xl">{c.steps[step]}</h2>

            {step === 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={c.firstName} id="a-fn" required error={errors.firstName}>
                  <input id="a-fn" className="field" autoComplete="given-name" {...inp("firstName")} />
                </Field>
                <Field label={c.lastName} id="a-ln" required error={errors.lastName}>
                  <input id="a-ln" className="field" autoComplete="family-name" {...inp("lastName")} />
                </Field>
                <Field label={c.email} id="a-em" required error={errors.email}>
                  <input id="a-em" type="email" className="field" autoComplete="email" {...inp("email")} />
                </Field>
                <Field label={c.phone} id="a-ph" required error={errors.phone}>
                  <input id="a-ph" type="tel" className="field" autoComplete="tel" placeholder="+357" {...inp("phone")} />
                </Field>
                <Field label={c.city} id="a-city" className="sm:col-span-2">
                  <input id="a-city" className="field" autoComplete="address-level2" {...inp("city")} />
                </Field>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <fieldset>
                  <legend className="label">{c.role} <span className="text-flame">*</span></legend>
                  <div className="flex flex-wrap gap-2">
                    {c.roles.map((r) => (
                      <label key={r} className={choice(d.role === r)}>
                        <input type="radio" name="role" className="sr-only" checked={d.role === r} onChange={() => set("role", r)} />
                        {r}
                      </label>
                    ))}
                  </div>
                  {errors.role && <p className="mt-1 text-xs text-red-300">{errors.role}</p>}
                </fieldset>
                <fieldset>
                  <legend className="label">{c.location}</legend>
                  <div className="flex flex-wrap gap-2">
                    {[{ id: "any", label: c.anyLocation }, ...locations.map((l) => ({ id: l.id, label: tr(l.name, lang) }))].map((o) => (
                      <label key={o.id} className={choice(d.location === o.id)}>
                        <input type="radio" name="loc" className="sr-only" checked={d.location === o.id} onChange={() => set("location", o.id)} />
                        {o.label}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend className="label">{c.type} <span className="text-flame">*</span></legend>
                  <div className="flex flex-wrap gap-2">
                    {c.types.map((v) => (
                      <label key={v} className={choice(d.type === v)}>
                        <input type="radio" name="type" className="sr-only" checked={d.type === v} onChange={() => set("type", v)} />
                        {v}
                      </label>
                    ))}
                  </div>
                  {errors.type && <p className="mt-1 text-xs text-red-300">{errors.type}</p>}
                </fieldset>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <fieldset>
                  <legend className="label">{c.days} <span className="text-flame">*</span></legend>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                    {[1, 2, 3, 4, 5, 6, 0].map((day) => {
                      const on = d.days.includes(day);
                      return (
                        <label key={day} className={`cursor-pointer rounded-xl border py-3 text-center text-sm font-semibold transition ${on ? "border-flame bg-flame/15 text-cream shadow-glow-sm" : "border-white/10 text-cream-muted hover:border-white/25"}`}>
                          <input type="checkbox" className="sr-only" checked={on} onChange={() => set("days", on ? d.days.filter((x) => x !== day) : [...d.days, day])} />
                          {t.locations.daysShort[day]}
                        </label>
                      );
                    })}
                  </div>
                  {errors.days && <p className="mt-1 text-xs text-red-300">{errors.days}</p>}
                </fieldset>
                <Field label={c.startDate} id="a-start">
                  <input id="a-start" type="date" className="field [color-scheme:dark] sm:max-w-xs" {...inp("startDate")} />
                </Field>
              </div>
            )}

            {step === 3 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={c.years} id="a-yrs">
                  <select id="a-yrs" className="field" {...inp("years")}>
                    <option value="">—</option>
                    {["0", "<1", "1–2", "3–5", "5+"].map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </Field>
                <Field label={c.languages} id="a-lang">
                  <input id="a-lang" className="field" placeholder="Ελληνικά, English…" {...inp("languages")} />
                </Field>
                <Field label={c.experience} id="a-exp" required error={errors.experience} className="sm:col-span-2">
                  <textarea id="a-exp" rows={4} maxLength={2000} className="field resize-none" placeholder={c.experiencePlaceholder} {...inp("experience")} />
                </Field>
                <Field label={c.why} id="a-why" className="sm:col-span-2">
                  <textarea id="a-why" rows={3} maxLength={1000} className="field resize-none" {...inp("why")} />
                </Field>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-5">
                <p className="text-cream-muted">{c.review}</p>
                <dl className="grid gap-x-6 gap-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm sm:grid-cols-2">
                  {[
                    [`${c.firstName} / ${c.lastName}`, `${d.firstName} ${d.lastName}`],
                    [c.email, d.email],
                    [c.phone, d.phone],
                    [c.city, d.city || "—"],
                    [c.role, d.role],
                    [c.location, locName],
                    [c.type, d.type],
                    [c.days, [1, 2, 3, 4, 5, 6, 0].filter((x) => d.days.includes(x)).map((x) => t.locations.daysShort[x]).join(", ")],
                    [c.startDate, d.startDate || "—"],
                    [c.years, d.years || "—"],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-xs text-cream-dim">{k}</dt>
                      <dd className="font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>
                <label className="flex items-start gap-3 text-sm">
                  <input type="checkbox" checked={d.consent} onChange={(e) => set("consent", e.target.checked)} className="mt-1 h-4 w-4 accent-[#ff6a1a]" />
                  <span>{c.consent}</span>
                </label>
                {errors.consent && <p className="text-xs text-red-300">{errors.consent}</p>}
                {state === "error" && <p className="text-sm text-red-300" role="alert">{t.common.error}</p>}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <button type="button" onClick={() => go(-1)} className={`btn-ghost ${step === 0 ? "invisible" : ""}`}>
          <Icon name="arrowLeft" /> {t.common.back}
        </button>
        {step < total - 1 ? (
          <button type="button" onClick={() => go(1)} className="btn-primary">
            {t.common.next} <Icon name="arrowRight" />
          </button>
        ) : (
          <button type="button" onClick={submit} disabled={state === "sending"} className="btn-primary">
            {state === "sending" ? t.common.sending : c.submit}
          </button>
        )}
      </div>
    </div>
  );
}
