"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import { Icon } from "@/components/ui/Icon";
import { fmt, tr, type L10n } from "@/lib/i18n";
import { Field } from "./Field";
import { Progress } from "./Progress";
import { useFormGuard } from "./useFormGuard";

/** Same questions as the job application on the old site. */
type Opt = { v: string; l: L10n };
type Q =
  | { k: string; type: "text" | "tel" | "email" | "number" | "date" | "textarea"; l: L10n; req?: boolean; ph?: L10n }
  | { k: string; type: "radio" | "select" | "multi"; l: L10n; req?: boolean; opts: Opt[] };

const o = (v: string, en: string, el = en): Opt => ({ v, l: { en, el } });
const YN = [o("yes", "Yes", "Ναι"), o("no", "No", "Όχι")];
const LEVEL = [o("basic", "Basic", "Βασικά"), o("good", "Good", "Καλά"), o("very-good", "Very good", "Πολύ καλά"), o("fluent", "Fluent", "Άπταιστα")];
const L = (en: string, el: string): L10n => ({ en, el });

const STEPS: Q[][] = [
  [
    { k: "fullName", type: "text", l: L("Full name", "Ονοματεπώνυμο"), req: true },
    { k: "age", type: "number", l: L("Age", "Ηλικία"), req: true },
    { k: "phone", type: "tel", l: L("Phone number", "Τηλέφωνο"), req: true },
    { k: "email", type: "email", l: L("Email", "Email") },
    { k: "area", type: "text", l: L("Area of residence", "Περιοχή διαμονής"), req: true },
  ],
  [
    { k: "position", type: "radio", l: L("Position applied for", "Θέση"), req: true, opts: [o("kitchen", "Kitchen", "Κουζίνα"), o("cashier", "Cashier", "Ταμείο"), o("delivery", "Delivery", "Διανομή"), o("cleaner", "Cleaner", "Καθαριότητα"), o("supervisor", "Supervisor", "Υπεύθυνος"), o("any", "Any", "Οποιαδήποτε")] },
    { k: "employment", type: "radio", l: L("Employment type", "Τύπος απασχόλησης"), req: true, opts: [o("full-time", "Full-time"), o("part-time", "Part-time"), o("either", "Either", "Και τα δύο")] },
    { k: "duration", type: "select", l: L("How long do you plan to work?", "Για πόσο διάστημα;"), req: true, opts: [o("<3m", "<3 months", "<3 μήνες"), o("3-6m", "3–6 months", "3–6 μήνες"), o("6-12m", "6–12 months", "6–12 μήνες"), o("1y", "1 year", "1 χρόνο"), o("1y+", "1+ year", "1+ χρόνο"), o("long-term", "Long-term", "Μακροχρόνια")] },
    { k: "permanence", type: "radio", l: L("Permanent / temporary / seasonal", "Μόνιμη / προσωρινή / εποχιακή"), req: true, opts: [o("permanent", "Permanent", "Μόνιμη"), o("temporary", "Temporary", "Προσωρινή"), o("seasonal", "Seasonal", "Εποχιακή"), o("no-preference", "No preference", "Αδιάφορο")] },
    { k: "startDate", type: "date", l: L("Available start date", "Ημερομηνία έναρξης"), req: true },
    { k: "fullyAvailable", type: "radio", l: L("Fully available during the week?", "Πλήρως διαθέσιμος/η τις καθημερινές;"), req: true, opts: YN },
    { k: "commitments", type: "multi", l: L("Regular commitments", "Σταθερές υποχρεώσεις"), req: true, opts: [o("university", "University", "Πανεπιστήμιο"), o("college", "College", "Κολέγιο"), o("school", "School", "Σχολείο"), o("lessons", "Lessons / training", "Μαθήματα / εκπαίδευση"), o("another-job", "Another job", "Άλλη δουλειά"), o("other", "Other", "Άλλο"), o("none", "None", "Καμία")] },
    { k: "evenings", type: "radio", l: L("Can work evenings?", "Βραδινές βάρδιες;"), req: true, opts: YN },
    { k: "weekends", type: "radio", l: L("Can work weekends?", "Σαββατοκύριακα;"), req: true, opts: YN },
    { k: "holidays", type: "radio", l: L("Can work public holidays?", "Αργίες;"), req: true, opts: YN },
  ],
  [
    { k: "hasExperience", type: "radio", l: L("Previous experience in this position?", "Εμπειρία στη θέση;"), req: true, opts: YN },
    { k: "experience", type: "textarea", l: L("Tell us about your experience", "Πείτε μας για την εμπειρία σας"), ph: L("Where have you worked? What did you do?", "Πού έχετε δουλέψει; Τι κάνατε;") },
  ],
  [
    { k: "licence", type: "radio", l: L("Valid driving licence?", "Δίπλωμα οδήγησης;"), req: true, opts: YN },
    { k: "ownTransport", type: "radio", l: L("Own means of transport?", "Δικό σας μεταφορικό μέσο;"), req: true, opts: YN },
    { k: "greek", type: "select", l: L("Greek level", "Ελληνικά"), req: true, opts: LEVEL },
    { k: "english", type: "select", l: L("English level", "Αγγλικά"), req: true, opts: LEVEL },
    { k: "otherLanguages", type: "text", l: L("Other languages", "Άλλες γλώσσες") },
    { k: "cyprusId", type: "radio", l: L("Cyprus ID available?", "Έχετε κυπριακή ταυτότητα;"), req: true, opts: YN },
    { k: "student", type: "radio", l: L("Currently a student?", "Είστε φοιτητής/φοιτήτρια;"), req: true, opts: YN },
  ],
  [
    { k: "why", type: "textarea", l: L("Why do you want to work at REY?", "Γιατί θέλετε να εργαστείτε στο REY;") },
    { k: "additional", type: "textarea", l: L("Additional information", "Πρόσθετες πληροφορίες") },
  ],
];
const STEP_NAMES: L10n[] = [L("About you", "Προσωπικά"), L("Position & availability", "Θέση & διαθεσιμότητα"), L("Experience", "Εμπειρία"), L("Transport, languages & documents", "Μεταφορά, γλώσσες & έγγραφα"), L("About you & send", "Για εσάς & αποστολή")];
const MAX_CV = 10 * 1024 * 1024;

export function CareersForm() {
  const { lang, t } = useI18n();
  const c = t.careers;
  const { field: honeypot, guard } = useFormGuard();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [d, setD] = useState<Record<string, string | string[]>>({});
  const [cv, setCv] = useState<File | null>(null);
  const [consent, setConsent] = useState({ privacy: false, verify: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const total = STEPS.length;

  const val = (k: string) => d[k] ?? "";
  const set = (k: string, v: string | string[]) => setD((x) => ({ ...x, [k]: v }));

  const validate = (s: number) => {
    const e: Record<string, string> = {};
    for (const q of STEPS[s]) {
      const v = d[q.k];
      if (q.req && (!v || (Array.isArray(v) && v.length === 0) || (typeof v === "string" && !v.trim()))) e[q.k] = t.common.required;
    }
    if (s === 0 && d.email && !/^\S+@\S+\.\S+$/.test(String(d.email))) e.email = t.common.required;
    if (s === 0 && d.phone && String(d.phone).replace(/\D/g, "").length < 7) e.phone = t.common.required;
    if (s === 2 && cv && cv.size > MAX_CV) e.cv = c.cvTooBig;
    if (s === total - 1 && !(consent.privacy && consent.verify)) e.consent = t.common.required;
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
    if (!validate(total - 1)) return;
    setState("sending");
    const fd = new FormData();
    const g = guard();
    fd.set("t", String(g.t));
    fd.set("website", g.website);
    fd.set("lang", lang);
    fd.set("data", JSON.stringify({ ...d, consentPrivacy: consent.privacy, consentVerify: consent.verify }));
    if (cv) fd.set("cv", cv);
    try {
      const res = await fetch("/api/careers", { method: "POST", body: fd });
      setState(res.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  };

  if (state === "sent") {
    return (
      <div className="glass p-10 text-center" role="status">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-flame text-onaccent shadow-glow">
          <Icon name="check" className="h-7 w-7" />
        </span>
        <p className="mt-5 text-lg">{c.sent}</p>
      </div>
    );
  }

  const chip = (active: boolean) => `chip cursor-pointer ${active ? "chip-active" : ""}`;

  const renderQ = (q: Q) => {
    const id = `a-${q.k}`;
    const label = tr(q.l, lang);
    const wide = q.type === "textarea" || q.type === "radio" || q.type === "multi";
    if (q.type === "radio" || q.type === "multi") {
      const cur = val(q.k);
      return (
        <fieldset key={q.k} className="sm:col-span-2">
          <legend className="label">
            {label}
            {q.req && <span className="text-flame"> *</span>}
          </legend>
          <div className="flex flex-wrap gap-2">
            {q.opts.map((op) => {
              const on = q.type === "multi" ? (cur as string[] | "").includes?.(op.v) ?? false : cur === op.v;
              return (
                <label key={op.v} className={chip(!!on)}>
                  <input
                    type={q.type === "multi" ? "checkbox" : "radio"}
                    name={q.k}
                    className="sr-only"
                    checked={!!on}
                    onChange={() => {
                      if (q.type === "radio") return set(q.k, op.v);
                      const arr = Array.isArray(cur) ? cur : [];
                      if (op.v === "none") return set(q.k, on ? [] : ["none"]);
                      const base = arr.filter((x) => x !== "none");
                      set(q.k, on ? base.filter((x) => x !== op.v) : [...base, op.v]);
                    }}
                  />
                  {tr(op.l, lang)}
                </label>
              );
            })}
          </div>
          {errors[q.k] && <p className="mt-1 text-xs text-red-600">{errors[q.k]}</p>}
        </fieldset>
      );
    }
    return (
      <Field key={q.k} label={label} id={id} required={q.req} error={errors[q.k]} className={wide ? "sm:col-span-2" : ""}>
        {q.type === "select" ? (
          <select id={id} className="field" value={val(q.k) as string} onChange={(e) => set(q.k, e.target.value)}>
            <option value="">{c.selectOption}</option>
            {q.opts.map((op) => (
              <option key={op.v} value={op.v}>{tr(op.l, lang)}</option>
            ))}
          </select>
        ) : q.type === "textarea" ? (
          <textarea id={id} rows={4} maxLength={2000} className="field resize-none" placeholder={q.ph ? tr(q.ph, lang) : undefined} value={val(q.k) as string} onChange={(e) => set(q.k, e.target.value)} />
        ) : (
          <input
            id={id}
            type={q.type}
            className={`field ${q.type === "date" ? "sm:max-w-xs" : ""}`}
            min={q.type === "number" ? 16 : undefined}
            max={q.type === "number" ? 80 : undefined}
            autoComplete={q.k === "fullName" ? "name" : q.k === "phone" ? "tel" : q.k === "email" ? "email" : undefined}
            value={val(q.k) as string}
            onChange={(e) => set(q.k, e.target.value)}
          />
        )}
      </Field>
    );
  };

  return (
    <div id="apply" className="glass relative scroll-mt-28 p-5 md:p-8">
      {honeypot}
      <Progress steps={STEP_NAMES.map((s) => tr(s, lang))} current={step} label={fmt(c.stepOf, { n: step + 1, total })} />
      <div className="relative mt-8 overflow-hidden">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={step} initial={{ opacity: 0, x: dir * 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -30 }} transition={{ duration: 0.25 }}>
            <h2 className="heading mb-6 text-3xl">{tr(STEP_NAMES[step], lang)}</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {STEPS[step].map(renderQ)}

              {step === 2 && (
                <div className="sm:col-span-2">
                  <label htmlFor="a-cv" className="label">{c.cv}</label>
                  <label htmlFor="a-cv" className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-black/20 bg-black/[0.03] p-4 hover:border-flame/60">
                    <Icon name="plus" className="h-5 w-5 text-flame" />
                    <span className="text-sm">{cv ? cv.name : c.cvPick}</span>
                  </label>
                  <input
                    id="a-cv"
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="sr-only"
                    onChange={(e) => setCv(e.target.files?.[0] ?? null)}
                  />
                  <p className="mt-1 text-xs text-cream-dim">{c.cvHelp}</p>
                  {errors.cv && <p className="mt-1 text-xs text-red-600">{errors.cv}</p>}
                </div>
              )}

              {step === total - 1 && (
                <div className="space-y-3 sm:col-span-2">
                  <label className="flex items-start gap-3 text-sm">
                    <input type="checkbox" checked={consent.privacy} onChange={(e) => setConsent((x) => ({ ...x, privacy: e.target.checked }))} className="mt-1 h-4 w-4 accent-[#00b8c3]" />
                    <span>
                      {c.consentPrivacy} <a href={`/${lang}/privacy`} target="_blank" className="underline hover:text-flame">{t.footer.privacy}</a> <span className="text-flame">*</span>
                    </span>
                  </label>
                  <label className="flex items-start gap-3 text-sm">
                    <input type="checkbox" checked={consent.verify} onChange={(e) => setConsent((x) => ({ ...x, verify: e.target.checked }))} className="mt-1 h-4 w-4 accent-[#00b8c3]" />
                    <span>{c.consentVerify} <span className="text-flame">*</span></span>
                  </label>
                  {errors.consent && <p className="text-xs text-red-600">{errors.consent}</p>}
                  {state === "error" && <p className="text-sm text-red-600" role="alert">{t.common.error}</p>}
                </div>
              )}
            </div>
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
