"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Field } from "@/components/forms/Field";
import { useFormGuard } from "@/components/forms/useFormGuard";
import { useI18n } from "@/components/providers/I18nProvider";
import { Icon } from "@/components/ui/Icon";
import { OpenBadge } from "@/components/ui/OpenBadge";
import { Stars } from "@/components/ui/Stars";
import { fmt, tr } from "@/lib/i18n";
import type { Location } from "@/lib/locations";
import type { ReviewSummary } from "@/lib/reviews";

function StarInput({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  const { t } = useI18n();
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <label key={n} className="cursor-pointer" onMouseEnter={() => setHover(n)}>
          <input type="radio" name="rating" value={n} checked={value === n} onChange={() => onChange(n)} className="peer sr-only" />
          <span className="sr-only">{fmt(t.reviews.starLabel, { n })}</span>
          <motion.span whileTap={{ scale: 0.85 }} className="block rounded-md peer-focus-visible:ring-2 peer-focus-visible:ring-flame">
            <Icon
              name="star"
              stroke="none"
              fill="currentColor"
              className={`h-9 w-9 transition ${n <= shown ? "text-ember drop-shadow-[0_0_8px_rgba(255,181,71,0.7)]" : "text-white/15"}`}
            />
          </motion.span>
        </label>
      ))}
    </div>
  );
}

export function ReviewSection({ loc, initial, demo }: { loc: Location; initial: ReviewSummary; demo: boolean }) {
  const { lang, t } = useI18n();
  const { field: honeypot, guard } = useFormGuard();
  const [summary, setSummary] = useState(initial);
  const [limit, setLimit] = useState(initial.reviews.length);
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [thanks, setThanks] = useState(false);

  const refresh = async (n: number) => {
    const res = await fetch(`/api/reviews?location=${loc.id}&limit=${n}`, { cache: "no-store" });
    if (res.ok) {
      setSummary(await res.json());
      setLimit(n);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!rating) return setError(t.reviews.errRating);
    if (!name.trim()) return setError(t.reviews.errName);
    if (comment.trim().length < 10) return setError(t.reviews.errComment);
    setSending(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...guard(), location: loc.id, rating, name, comment }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error === "rate" ? t.reviews.errRate : data.error === "spam" ? t.reviews.errSpam : t.common.error);
        return;
      }
      setThanks(true);
      setRating(0);
      setName("");
      setComment("");
      await refresh(Math.max(limit, 6));
    } catch {
      setError(t.common.error);
    } finally {
      setSending(false);
    }
  };

  const locale = lang === "el" ? "el-CY" : "en-GB";

  return (
    <section id={loc.id} className="scroll-mt-28" aria-labelledby={`rv-${loc.id}`}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <OpenBadge locationId={loc.id} />
          <h2 id={`rv-${loc.id}`} className="heading mt-3 text-5xl md:text-6xl">{tr(loc.name, lang)}</h2>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-6">
          <div className="glass p-6">
            <p className="text-xs uppercase tracking-widest text-cream-dim">{t.reviews.average}</p>
            <p className="mt-2 flex items-end gap-3">
              <span className="font-display text-7xl font-extrabold leading-none text-flame neon-text">{summary.count ? summary.average.toFixed(1) : "–"}</span>
              <span className="pb-2 text-cream-dim">/ 5</span>
            </p>
            <Stars value={summary.average} className="mt-3 h-5 w-5" />
            <p className="mt-2 text-sm text-cream-dim">{fmt(t.reviews.basedOn, { n: summary.count })}</p>
          </div>

          <form onSubmit={submit} className="glass relative space-y-4 p-6" noValidate>
            {honeypot}
            <h3 className="heading text-2xl">{t.reviews.leave}</h3>
            <div>
              <p className="label">{t.reviews.rating}</p>
              <StarInput value={rating} onChange={setRating} label={t.reviews.rating} />
            </div>
            <Field label={t.reviews.name} id={`n-${loc.id}`}>
              <input id={`n-${loc.id}`} className="field" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" />
            </Field>
            <Field label={t.reviews.comment} id={`c-${loc.id}`}>
              <textarea id={`c-${loc.id}`} rows={4} maxLength={1000} className="field resize-none" placeholder={t.reviews.commentPlaceholder} value={comment} onChange={(e) => setComment(e.target.value)} />
            </Field>
            {error && <p className="text-sm text-red-300" role="alert">{error}</p>}
            <AnimatePresence>
              {thanks && !error && (
                <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-sm text-emerald-300" role="status">
                  <Icon name="check" className="h-4 w-4" /> {t.reviews.thanks}
                </motion.p>
              )}
            </AnimatePresence>
            <button type="submit" disabled={sending} className="btn-primary w-full">
              {sending ? t.common.sending : t.reviews.submit}
            </button>
            {demo && <p className="text-xs text-cream-dim">{t.reviews.demo}</p>}
          </form>
        </div>

        <div>
          <h3 className="kicker mb-4">{t.reviews.newest}</h3>
          {summary.reviews.length === 0 ? (
            <p className="glass p-6 text-cream-muted">{t.reviews.noReviews}</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              <AnimatePresence initial={false}>
                {summary.reviews.map((r) => (
                  <motion.li key={r.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass p-5">
                    <div className="flex items-center justify-between gap-2">
                      <Stars value={r.rating} label={fmt(t.reviews.starLabel, { n: r.rating })} />
                      <time dateTime={r.created_at} className="text-xs text-cream-dim">
                        {new Date(r.created_at).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })}
                      </time>
                    </div>
                    <p className="mt-3 whitespace-pre-line text-cream">{r.comment}</p>
                    <p className="mt-3 text-sm font-semibold text-cream-muted">— {r.name}</p>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
          {summary.count > summary.reviews.length && (
            <button type="button" onClick={() => refresh(limit + 6)} className="btn-ghost mt-4">
              {t.reviews.showMore}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
