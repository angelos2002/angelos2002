"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { lineLabel } from "@/components/CartDrawer";
import { Field } from "@/components/forms/Field";
import { Progress } from "@/components/forms/Progress";
import { useFormGuard } from "@/components/forms/useFormGuard";
import { linePrice, useCart } from "@/components/providers/CartProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import { useStoreOverrides } from "@/components/providers/StoreStatusProvider";
import { AnimatedPrice } from "@/components/ui/AnimatedPrice";
import { Icon } from "@/components/ui/Icon";
import { OpenBadge } from "@/components/ui/OpenBadge";
import { loadCustomer, saveCustomer, saveRecentOrder } from "@/lib/customer";
import { fmt, tr } from "@/lib/i18n";
import { activeModes, getOpenStatus, locations, scheduleSlots, type OrderMode } from "@/lib/locations";
import { formatPrice, getItem } from "@/lib/menu";
import { DELIVERY_FEE, TIP_PERCENTS } from "@/lib/site";

const MODE_ICON: Record<OrderMode, string> = { delivery: "truck", takeaway: "bag", dinein: "store" };
const r2 = (n: number) => Math.round(n * 100) / 100;

export function Checkout() {
  const { lang, t } = useI18n();
  const c = t.checkout;
  const { lines, subtotal, clear, hydrated } = useCart();
  const { overrides } = useStoreOverrides();
  const { field: honeypot, guard } = useFormGuard();
  const locale = lang === "el" ? "el-CY" : "en-GB";

  const [step, setStep] = useState(0);
  const [location, setLocation] = useState(locations[0].id);
  const [mode, setMode] = useState<OrderMode>("delivery");
  const [when, setWhen] = useState<"asap" | "later">("asap");
  const [day, setDay] = useState("");
  const [slot, setSlot] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", table: "", notes: "" });
  const [saved, setSaved] = useState<string[]>([]);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<{ code: string; discount: number } | null>(null);
  const [promoMsg, setPromoMsg] = useState("");
  const [tipPct, setTipPct] = useState<number | "custom">(0);
  const [tipCustom, setTipCustom] = useState("");
  const [sending, setSending] = useState(false);
  const [serverError, setServerError] = useState("");
  const [done, setDone] = useState<{ ref: string; name: string; phone: string; whenText: string } | null>(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  // prefill from this device
  useEffect(() => {
    const s = loadCustomer();
    if (s) {
      setForm((f) => ({ ...f, name: s.name, phone: s.phone, email: s.email, address: s.addresses[0] ?? "" }));
      setSaved(s.addresses);
    }
  }, []);

  const loc = locations.find((l) => l.id === location)!;
  const override = overrides[location];
  const modes = activeModes(loc, override);
  const status = getOpenStatus(loc, now, override);
  const isOpen = status.state === "open";
  const storeUnavailable = (id: string) => {
    const l = locations.find((x) => x.id === id)!;
    const o = overrides[id];
    return activeModes(l, o).length === 0 || o?.mode === "closed" || (o?.mode !== "open" && getOpenStatus(l, now, o).state === "season");
  };

  const slots = useMemo(() => scheduleSlots(loc, now), [loc, now]);
  const days = useMemo(() => [...new Set(slots.map((s) => s.ymd))], [slots]);

  // keep selections valid
  useEffect(() => {
    if (!modes.includes(mode) && modes[0]) setMode(modes[0]);
  }, [location, modes.join()]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!isOpen) setWhen("later");
  }, [isOpen, location]);
  useEffect(() => {
    if (!days.includes(day)) setDay(days[0] ?? "");
  }, [days.join()]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const daySlots = slots.filter((s) => s.ymd === day);
    if (!daySlots.some((s) => s.iso === slot)) setSlot(daySlots[0]?.iso ?? "");
  }, [day, slots]); // eslint-disable-line react-hooks/exhaustive-deps
  // promo depends on subtotal / mode / store
  useEffect(() => {
    if (promo) setPromo(null);
  }, [subtotal, mode, location]); // eslint-disable-line react-hooks/exhaustive-deps

  const fee = mode === "delivery" ? DELIVERY_FEE : 0;
  const discount = promo?.discount ?? 0;
  const tip = tipPct === "custom" ? r2(Math.max(0, Math.min(Number(tipCustom.replace(",", ".")) || 0, 100))) : r2((subtotal * tipPct) / 100);
  const total = r2(subtotal - discount + fee + tip);

  const dayLabel = (ymd: string) => {
    const d = new Date(`${ymd}T12:00:00Z`);
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Nicosia" }).format(now);
    const tomorrow = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Nicosia" }).format(new Date(now.getTime() + 86400000));
    if (ymd === today) return t.common.today;
    if (ymd === tomorrow) return t.common.tomorrow;
    return d.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "short", timeZone: "UTC" });
  };
  const slotTime = slots.find((s) => s.iso === slot)?.time ?? "";
  const whenText = when === "asap" ? c.asapLabel : `${dayLabel(day)} ${slotTime}`;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validateStep0 = () => {
    const e: Record<string, string> = {};
    if (!modes.includes(mode)) e.mode = c.errMode;
    if (when === "later" && !slot) e.when = c.noSlots;
    if (when === "asap" && !isOpen) e.when = c.closedNow;
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const validateDetails = () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = t.common.required;
    if (form.phone.replace(/\D/g, "").length < 7) e.phone = t.common.required;
    if (mode === "delivery" && form.address.trim().length < 5) e.address = t.common.required;
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const next = () => {
    if (step === 0 && !validateStep0()) return;
    if (step === 1 && !validateDetails()) return;
    setStep((s) => Math.min(2, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const applyPromoCode = async () => {
    setPromoMsg("");
    if (!promoInput.trim()) return;
    const res = await fetch("/api/promo", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code: promoInput, subtotal, mode, location }),
    }).then((r) => r.json()).catch(() => ({ ok: false, reason: "invalid" }));
    if (res.ok) {
      setPromo({ code: res.code, discount: res.discount });
      setPromoMsg(fmt(c.promoApplied, { code: res.code }));
    } else {
      setPromo(null);
      setPromoMsg(res.reason === "min" ? fmt(c.promoMin, { min: formatPrice(res.minSubtotal, lang) }) : c.promoInvalid);
    }
  };

  const place = async () => {
    setSending(true);
    setServerError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...guard(),
          lang,
          mode,
          location,
          when: when === "asap" ? "asap" : slot,
          customer: { ...form, address: mode === "delivery" ? form.address : "", table: mode === "dinein" ? form.table : "" },
          lines: lines.map(({ itemId, selections, qty, notes }) => ({ itemId, selections, qty, notes })),
          promo: promo?.code,
          tip,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const map: Record<string, string> = { closed: c.errClosed, time: c.errTime, mode: c.errMode, promo: c.errPromo, details: c.validation };
        setServerError(map[data.error] ?? t.common.error);
        if (data.error === "closed" || data.error === "time" || data.error === "mode") setStep(0);
        if (data.error === "promo") setPromo(null);
        return;
      }
      if (remember) saveCustomer({ name: form.name, phone: form.phone, email: form.email }, mode === "delivery" ? form.address : undefined);
      saveRecentOrder({
        ref: data.ref,
        date: new Date().toISOString(),
        location,
        mode,
        total: data.total ?? total,
        lines: lines.map(({ itemId, selections, qty, notes }) => ({ itemId, selections, qty, notes })),
      });
      setDone({ ref: data.ref, name: form.name, phone: form.phone, whenText });
      clear();
    } catch {
      setServerError(t.common.error);
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="glass mx-auto max-w-xl p-10 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-flame text-onaccent shadow-glow">
          <Icon name="check" className="h-8 w-8" />
        </span>
        <h2 className="heading mt-6 text-5xl">{c.confirmed}</h2>
        <p className="mt-4 text-cream-muted">{fmt(c.confirmedText, done)}</p>
        <p className="mt-2 text-sm text-cream-dim">
          {tr(loc.name, lang)} · {c[mode]} · {done.whenText}
        </p>
        <Link href={`/${lang}/menu`} className="btn-ghost mt-8">{c.backToMenu}</Link>
      </motion.div>
    );
  }

  if (hydrated && lines.length === 0) {
    return (
      <div className="glass mx-auto max-w-xl p-10 text-center">
        <Icon name="bag" className="mx-auto h-10 w-10 text-flame/60" />
        <p className="mt-4 text-cream-muted">{c.empty}</p>
        <Link href={`/${lang}/menu`} className="btn-primary mt-6">{t.common.viewMenu}</Link>
      </div>
    );
  }

  const chip = (active: boolean) => `chip cursor-pointer ${active ? "chip-active" : ""}`;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="glass relative p-5 md:p-8">
        {honeypot}
        <Progress steps={c.steps} current={step} />
        {serverError && <p className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-700" role="alert">{serverError}</p>}
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="mt-8">
            {step === 0 && (
              <div className="space-y-8">
                <fieldset>
                  <legend className="heading mb-4 text-2xl">{c.chooseStore}</legend>
                  <div className="space-y-2">
                    {locations.map((l) => {
                      const off = storeUnavailable(l.id);
                      const lm = activeModes(l, overrides[l.id]);
                      return (
                        <label
                          key={l.id}
                          className={`flex flex-col items-start justify-between gap-2 rounded-2xl border p-4 transition sm:flex-row sm:items-center sm:gap-3 ${off ? "cursor-not-allowed opacity-45" : "cursor-pointer"} ${location === l.id && !off ? "border-flame bg-flame/10" : "border-black/10 hover:border-black/25"}`}
                        >
                          <input type="radio" name="loc" className="sr-only" disabled={off} checked={location === l.id} onChange={() => setLocation(l.id)} />
                          <span>
                            <span className="block font-semibold">{tr(l.name, lang)}</span>
                            <span className="block text-xs text-cream-dim">{tr(l.address, lang)}</span>
                            <span className="mt-1 block text-[11px] font-bold uppercase tracking-wider text-cream-muted">
                              {lm.length ? lm.map((m) => c[m]).join(" · ") : c.notAccepting}
                            </span>
                          </span>
                          <OpenBadge locationId={l.id} className="shrink-0" />
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="heading mb-4 text-2xl">{c.orderType}</legend>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {loc.modes.map((m) => {
                      const ok = modes.includes(m);
                      return (
                        <label key={m} className={`rounded-2xl border p-3 transition sm:p-4 ${!ok ? "cursor-not-allowed opacity-40" : "cursor-pointer"} ${mode === m && ok ? "border-flame bg-flame/10 shadow-glow-sm" : "border-black/10 hover:border-black/25"}`}>
                          <input type="radio" name="mode" className="sr-only" disabled={!ok} checked={mode === m} onChange={() => setMode(m)} />
                          <Icon name={MODE_ICON[m]} className="h-6 w-6 text-flame sm:h-7 sm:w-7" />
                          <span className="mt-2 block font-display text-lg font-bold uppercase leading-tight sm:text-xl">{c[m]}</span>
                          <span className="hidden text-xs text-cream-dim sm:block">{ok ? c[`${m}Text` as const] : c.pausedNote}</span>
                        </label>
                      );
                    })}
                  </div>
                  {errors.mode && <p className="mt-2 text-xs text-red-600">{errors.mode}</p>}
                </fieldset>

                <fieldset>
                  <legend className="heading mb-4 text-2xl">{c.when}</legend>
                  {!isOpen && <p className="mb-3 rounded-xl border border-ember/30 bg-ember/10 p-3 text-sm text-ember">{c.closedNow}</p>}
                  <div className="flex flex-wrap gap-2">
                    <label className={`${chip(when === "asap")} ${!isOpen ? "pointer-events-none opacity-40" : ""}`}>
                      <input type="radio" name="when" className="sr-only" disabled={!isOpen} checked={when === "asap"} onChange={() => setWhen("asap")} />
                      <Icon name="flame" className="h-4 w-4" /> {c.asap}
                    </label>
                    <label className={chip(when === "later")}>
                      <input type="radio" name="when" className="sr-only" checked={when === "later"} onChange={() => setWhen("later")} />
                      <Icon name="clock" className="h-4 w-4" /> {c.scheduled}
                    </label>
                  </div>
                  {when === "later" &&
                    (days.length === 0 ? (
                      <p className="mt-3 text-sm text-cream-dim">{c.noSlots}</p>
                    ) : (
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div>
                          <label htmlFor="c-day" className="label">{c.day}</label>
                          <select id="c-day" className="field" value={day} onChange={(e) => setDay(e.target.value)}>
                            {days.map((d) => (
                              <option key={d} value={d}>{dayLabel(d)}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="c-slot" className="label">{c.timeSlot}</label>
                          <select id="c-slot" className="field" value={slot} onChange={(e) => setSlot(e.target.value)}>
                            {slots.filter((s) => s.ymd === day).map((s) => (
                              <option key={s.iso} value={s.iso}>{s.time}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  {errors.when && <p className="mt-2 text-xs text-red-600">{errors.when}</p>}
                </fieldset>
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={c.name} id="c-name" required error={errors.name}>
                  <input id="c-name" className="field" autoComplete="name" value={form.name} onChange={set("name")} />
                </Field>
                <Field label={c.phone} id="c-phone" required error={errors.phone}>
                  <input id="c-phone" type="tel" className="field" autoComplete="tel" inputMode="tel" placeholder="+357" value={form.phone} onChange={set("phone")} />
                </Field>
                <Field label={c.email} id="c-email" className="sm:col-span-2">
                  <input id="c-email" type="email" className="field" autoComplete="email" value={form.email} onChange={set("email")} />
                </Field>
                {mode === "delivery" && (
                  <div className="sm:col-span-2">
                    {saved.length > 0 && (
                      <fieldset className="mb-3">
                        <legend className="label">{c.savedAddresses}</legend>
                        <div className="flex flex-wrap gap-2">
                          {saved.map((a) => (
                            <button key={a} type="button" onClick={() => setForm((f) => ({ ...f, address: a }))} className={chip(form.address === a)}>
                              <Icon name="pin" className="h-4 w-4" /> {a}
                            </button>
                          ))}
                          <button type="button" onClick={() => setForm((f) => ({ ...f, address: "" }))} className={chip(!saved.includes(form.address))}>
                            <Icon name="plus" className="h-4 w-4" /> {c.newAddress}
                          </button>
                        </div>
                      </fieldset>
                    )}
                    <Field label={c.address} id="c-addr" required error={errors.address}>
                      <input id="c-addr" className="field" autoComplete="street-address" placeholder={c.addressPlaceholder} value={form.address} onChange={set("address")} />
                    </Field>
                  </div>
                )}
                {mode === "dinein" && (
                  <Field label={c.table} id="c-table" className="sm:col-span-2">
                    <input id="c-table" className="field sm:max-w-xs" inputMode="numeric" value={form.table} onChange={set("table")} />
                  </Field>
                )}
                <Field label={c.notes} id="c-notes" className="sm:col-span-2">
                  <textarea id="c-notes" rows={3} maxLength={500} className="field resize-none" value={form.notes} onChange={set("notes")} />
                </Field>
                <label className="flex items-center gap-3 text-sm text-cream-muted sm:col-span-2">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 accent-[#00b8c3]" />
                  {c.remember}
                </label>
                {Object.keys(errors).length > 0 && <p className="text-sm text-red-600 sm:col-span-2">{c.validation}</p>}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-7">
                <div className="rounded-2xl border border-black/10 bg-black/[0.03] p-4 text-sm">
                  <p className="font-semibold">{tr(loc.name, lang)} · {c[mode]}</p>
                  <p className="text-cream-dim">{whenText}{mode === "delivery" && form.address ? ` · ${form.address}` : ""}{mode === "dinein" && form.table ? ` · #${form.table}` : ""}</p>
                </div>

                <fieldset>
                  <legend className="heading mb-3 text-xl">{c.tip}</legend>
                  <div className="flex flex-wrap items-center gap-2">
                    {TIP_PERCENTS.map((p) => (
                      <button key={p} type="button" onClick={() => setTipPct(p)} className={chip(tipPct === p)}>
                        {p === 0 ? c.tipNone : `${p}% · ${formatPrice(r2((subtotal * p) / 100), lang)}`}
                      </button>
                    ))}
                    <button type="button" onClick={() => setTipPct("custom")} className={chip(tipPct === "custom")}>{c.tipCustom}</button>
                    {tipPct === "custom" && (
                      <input aria-label={c.tipCustom} inputMode="decimal" className="field w-28 py-1.5" placeholder="€" value={tipCustom} onChange={(e) => setTipCustom(e.target.value)} />
                    )}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="heading mb-3 text-xl">{c.promo}</legend>
                  {promo ? (
                    <div className="flex items-center gap-3 text-sm text-emerald-700">
                      <Icon name="check" className="h-4 w-4" /> {promoMsg}
                      <button type="button" className="text-cream-dim underline" onClick={() => { setPromo(null); setPromoMsg(""); setPromoInput(""); }}>{c.removePromo}</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input aria-label={c.promo} className="field max-w-xs uppercase" placeholder={c.promoPlaceholder} value={promoInput} onChange={(e) => setPromoInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyPromoCode())} />
                      <button type="button" onClick={applyPromoCode} className="btn-ghost px-5 py-2 text-base">{c.apply}</button>
                    </div>
                  )}
                  {!promo && promoMsg && <p className="mt-2 text-xs text-red-600">{promoMsg}</p>}
                </fieldset>

                <div>
                  <h2 className="heading mb-3 text-xl">{c.payment}</h2>
                  <div className="rounded-2xl border border-dashed border-flame/40 bg-flame/5 p-4 text-sm text-cream-muted">{c.paymentPlaceholder}</div>
                  <label className="mt-3 flex items-center gap-3 rounded-2xl border border-flame bg-flame/10 p-4">
                    <input type="radio" checked readOnly className="accent-[#00b8c3]" />
                    <span className="text-sm">{c.payOnDelivery}</span>
                  </label>
                </div>
                <p className="text-xs text-cream-dim">{c.privacyNotice}</p>
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
              <Icon name="arrowLeft" /> {c.editCart}
            </Link>
          )}
          {step < 2 ? (
            <button type="button" onClick={next} className="btn-primary">
              {t.common.next} <Icon name="arrowRight" />
            </button>
          ) : (
            <button type="button" onClick={place} disabled={sending} className="btn-primary">
              {sending ? t.common.sending : c.placeOrder}
            </button>
          )}
        </div>
      </div>

      <aside className="glass h-fit p-5 lg:sticky lg:top-28">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="heading text-2xl">{c.summary}</h2>
          <Link href={`/${lang}/menu`} className="text-xs text-cream-dim underline hover:text-cream">{c.editCart}</Link>
        </div>
        <ul className="space-y-3 text-sm">
          {lines.map((l) => {
            const item = getItem(l.itemId)!;
            const label = lineLabel(l.itemId, l.selections, lang);
            return (
              <li key={l.key} className="flex justify-between gap-3">
                <span>
                  <span className="font-semibold">{l.qty}× {tr(item.name, lang)}</span>
                  {label && <span className="block text-xs text-cream-dim">{label}</span>}
                </span>
                <span className="tabular-nums">{formatPrice(linePrice(l), lang)}</span>
              </li>
            );
          })}
        </ul>
        <dl className="mt-5 space-y-2 border-t border-black/10 pt-4 text-sm">
          <div className="flex justify-between"><dt className="text-cream-muted">{c.subtotal}</dt><dd className="tabular-nums">{formatPrice(subtotal, lang)}</dd></div>
          {discount > 0 && <div className="flex justify-between text-emerald-700"><dt>{c.discount} ({promo?.code})</dt><dd className="tabular-nums">−{formatPrice(discount, lang)}</dd></div>}
          {fee > 0 && <div className="flex justify-between"><dt className="text-cream-muted">{c.deliveryFee}</dt><dd className="tabular-nums">{formatPrice(fee, lang)}</dd></div>}
          {tip > 0 && <div className="flex justify-between"><dt className="text-cream-muted">{c.tip}</dt><dd className="tabular-nums">{formatPrice(tip, lang)}</dd></div>}
          <div className="flex items-baseline justify-between pt-2"><dt className="font-semibold">{c.total}</dt><dd><AnimatedPrice value={total} lang={lang} className="font-display text-3xl font-bold text-flame" /></dd></div>
        </dl>
      </aside>
    </div>
  );
}
