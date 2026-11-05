"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { lineLabel } from "@/components/CartDrawer";
import { Field } from "@/components/forms/Field";
import { Progress } from "@/components/forms/Progress";
import { useFormGuard } from "@/components/forms/useFormGuard";
import { linePrice, useCart } from "@/components/providers/CartProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import { AnimatedPrice } from "@/components/ui/AnimatedPrice";
import { Icon } from "@/components/ui/Icon";
import { OpenBadge } from "@/components/ui/OpenBadge";
import { fmt, tr } from "@/lib/i18n";
import { getOpenStatus, locations } from "@/lib/locations";
import { formatPrice, getItem } from "@/lib/menu";
import { DELIVERY_FEE } from "@/lib/site";

type Mode = "delivery" | "takeaway";

export function Checkout() {
  const { lang, t } = useI18n();
  const { lines, subtotal, clear, hydrated } = useCart();
  const { field: honeypot, guard } = useFormGuard();
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<Mode>("delivery");
  const [location, setLocation] = useState(locations[0].id);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", notes: "", when: "asap", time: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<{ ref: string; name: string; phone: string } | null>(null);
  const [failed, setFailed] = useState(false);

  const available = (id: string) => {
    const loc = locations.find((l) => l.id === id)!;
    if (getOpenStatus(loc).state === "season") return false;
    return mode === "takeaway" || loc.delivery;
  };

  useEffect(() => {
    if (!available(location)) {
      const first = locations.find((l) => available(l.id));
      if (first) setLocation(first.id);
    }
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const fee = mode === "delivery" ? DELIVERY_FEE : 0;
  const total = subtotal + fee;
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validateDetails = () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = t.common.required;
    if (!/^[+\d][\d\s-]{6,}$/.test(form.phone.trim())) e.phone = t.common.required;
    if (mode === "delivery" && form.address.trim().length < 5) e.address = t.common.required;
    if (form.when === "later" && !form.time) e.time = t.common.required;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (step === 1 && !validateDetails()) return;
    setStep((s) => Math.min(2, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const place = async () => {
    setSending(true);
    setFailed(false);
    try {
      const res = await fetch("/api/forms/order", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...guard(),
          lang,
          mode,
          location,
          customer: form,
          lines: lines.map((l) => ({ ...l, name: getItem(l.itemId)?.name.en, options: lineLabel(l.itemId, l.selections, "en"), total: linePrice(l) })),
          subtotal,
          fee,
          total,
          payment: "on_delivery",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDone({ ref: data.ref ?? "SFR", name: form.name, phone: form.phone });
      clear();
    } catch {
      setFailed(true);
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="glass mx-auto max-w-xl p-10 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-flame text-ink shadow-glow">
          <Icon name="check" className="h-8 w-8" />
        </span>
        <h2 className="heading mt-6 text-5xl">{t.checkout.confirmed}</h2>
        <p className="mt-4 text-cream-muted">{fmt(t.checkout.confirmedText, done)}</p>
        <Link href={`/${lang}/menu`} className="btn-ghost mt-8">{t.checkout.backToMenu}</Link>
      </motion.div>
    );
  }

  if (hydrated && lines.length === 0) {
    return (
      <div className="glass mx-auto max-w-xl p-10 text-center">
        <Icon name="bag" className="mx-auto h-10 w-10 text-flame/60" />
        <p className="mt-4 text-cream-muted">{t.checkout.empty}</p>
        <Link href={`/${lang}/menu`} className="btn-primary mt-6">{t.common.viewMenu}</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="glass relative p-5 md:p-8">
        {honeypot}
        <Progress steps={t.checkout.steps} current={step} />
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="mt-8">
            {step === 0 && (
              <div className="space-y-8">
                <fieldset>
                  <legend className="heading mb-4 text-2xl">{t.checkout.mode}</legend>
                  <div className="grid grid-cols-2 gap-3">
                    {(["delivery", "takeaway"] as Mode[]).map((m) => (
                      <label key={m} className={`cursor-pointer rounded-2xl border p-4 transition ${mode === m ? "border-flame bg-flame/10 shadow-glow-sm" : "border-white/10 hover:border-white/25"}`}>
                        <input type="radio" name="mode" className="sr-only" checked={mode === m} onChange={() => setMode(m)} />
                        <Icon name={m === "delivery" ? "truck" : "store"} className="h-7 w-7 text-flame" />
                        <span className="mt-3 block font-display text-xl font-bold uppercase">{t.checkout[m]}</span>
                        <span className="block text-xs text-cream-dim">{t.checkout[`${m}Text` as const]}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend className="heading mb-4 text-2xl">{t.checkout.location}</legend>
                  <div className="space-y-2">
                    {locations.map((l) => {
                      const ok = available(l.id);
                      return (
                        <label key={l.id} className={`flex flex-col items-start justify-between gap-2 rounded-2xl border p-4 transition sm:flex-row sm:items-center sm:gap-3 ${!ok ? "cursor-not-allowed opacity-45" : "cursor-pointer"} ${location === l.id && ok ? "border-flame bg-flame/10" : "border-white/10 hover:border-white/25"}`}>
                          <input type="radio" name="loc" className="sr-only" disabled={!ok} checked={location === l.id} onChange={() => setLocation(l.id)} />
                          <span>
                            <span className="block font-semibold">{tr(l.name, lang)}</span>
                            <span className="block text-xs text-cream-dim">{tr(l.address, lang)}</span>
                            {mode === "delivery" && !l.delivery && <span className="mt-1 block text-xs text-ember">{t.checkout.deliveryNotAvailable}</span>}
                          </span>
                          <OpenBadge locationId={l.id} className="shrink-0" />
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t.checkout.name} id="c-name" required error={errors.name}>
                  <input id="c-name" className="field" autoComplete="name" value={form.name} onChange={set("name")} />
                </Field>
                <Field label={t.checkout.phone} id="c-phone" required error={errors.phone}>
                  <input id="c-phone" type="tel" className="field" autoComplete="tel" inputMode="tel" placeholder="+357" value={form.phone} onChange={set("phone")} />
                </Field>
                <Field label={t.checkout.email} id="c-email" className="sm:col-span-2">
                  <input id="c-email" type="email" className="field" autoComplete="email" value={form.email} onChange={set("email")} />
                </Field>
                {mode === "delivery" && (
                  <Field label={t.checkout.address} id="c-addr" required error={errors.address} className="sm:col-span-2">
                    <input id="c-addr" className="field" autoComplete="street-address" placeholder={t.checkout.addressPlaceholder} value={form.address} onChange={set("address")} />
                  </Field>
                )}
                <fieldset className="sm:col-span-2">
                  <legend className="label">{t.checkout.time}</legend>
                  <div className="flex flex-wrap gap-2">
                    {[["asap", t.checkout.asap], ["later", t.checkout.scheduled]].map(([v, label]) => (
                      <label key={v} className={`chip cursor-pointer ${form.when === v ? "chip-active" : ""}`}>
                        <input type="radio" name="when" className="sr-only" checked={form.when === v} onChange={() => setForm((f) => ({ ...f, when: v }))} />
                        <Icon name="clock" className="h-4 w-4" /> {label}
                      </label>
                    ))}
                    {form.when === "later" && (
                      <input type="time" aria-label={t.checkout.scheduled} className="field w-auto py-1.5" value={form.time} onChange={set("time")} />
                    )}
                  </div>
                  {errors.time && <p className="mt-1 text-xs text-red-300">{errors.time}</p>}
                </fieldset>
                <Field label={t.checkout.notes} id="c-notes" className="sm:col-span-2">
                  <textarea id="c-notes" rows={3} className="field resize-none" value={form.notes} onChange={set("notes")} />
                </Field>
                {Object.keys(errors).length > 0 && <p className="text-sm text-red-300 sm:col-span-2">{t.checkout.validation}</p>}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <h2 className="heading text-2xl">{t.checkout.payment}</h2>
                <div className="rounded-2xl border border-dashed border-flame/40 bg-flame/5 p-5 text-sm text-cream-muted">
                  <Icon name="flame" className="mb-2 h-6 w-6 text-flame" />
                  {t.checkout.paymentPlaceholder}
                </div>
                <label className="flex items-center gap-3 rounded-2xl border border-flame bg-flame/10 p-4">
                  <input type="radio" checked readOnly className="accent-[#ff6a1a]" />
                  <span className="text-sm">{t.checkout.payOnDelivery}</span>
                </label>
                {failed && <p className="text-sm text-red-300" role="alert">{t.common.error}</p>}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-between gap-3">
          {step > 0 ? (
            <button type="button" onClick={() => setStep((s) => s - 1)} className="btn-ghost">
              <Icon name="arrowLeft" /> {t.common.back}
            </button>
          ) : (
            <Link href={`/${lang}/menu`} className="btn-ghost">
              <Icon name="arrowLeft" /> {t.nav.menu}
            </Link>
          )}
          {step < 2 ? (
            <button type="button" onClick={next} className="btn-primary">
              {t.common.next} <Icon name="arrowRight" />
            </button>
          ) : (
            <button type="button" onClick={place} disabled={sending} className="btn-primary">
              {sending ? t.common.sending : t.checkout.placeOrder}
            </button>
          )}
        </div>
      </div>

      <aside className="glass h-fit p-5 lg:sticky lg:top-28">
        <h2 className="heading mb-4 text-2xl">{t.checkout.summary}</h2>
        <ul className="space-y-3 text-sm">
          {lines.map((l) => {
            const item = getItem(l.itemId)!;
            return (
              <li key={l.key} className="flex justify-between gap-3">
                <span>
                  <span className="font-semibold">{l.qty}× {tr(item.name, lang)}</span>
                  {lineLabel(l.itemId, l.selections, lang) && <span className="block text-xs text-cream-dim">{lineLabel(l.itemId, l.selections, lang)}</span>}
                </span>
                <span className="tabular-nums">{formatPrice(linePrice(l), lang)}</span>
              </li>
            );
          })}
        </ul>
        <dl className="mt-5 space-y-2 border-t border-white/10 pt-4 text-sm">
          <div className="flex justify-between"><dt className="text-cream-muted">{t.checkout.subtotal}</dt><dd className="tabular-nums">{formatPrice(subtotal, lang)}</dd></div>
          <div className="flex justify-between"><dt className="text-cream-muted">{t.checkout.deliveryFee}</dt><dd className="tabular-nums">{formatPrice(fee, lang)}</dd></div>
          <div className="flex items-baseline justify-between pt-2"><dt className="font-semibold">{t.checkout.total}</dt><dd><AnimatedPrice value={total} lang={lang} className="font-display text-3xl font-bold text-flame" /></dd></div>
        </dl>
      </aside>
    </div>
  );
}
