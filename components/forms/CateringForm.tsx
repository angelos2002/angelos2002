"use client";

import { useState } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import { Icon } from "@/components/ui/Icon";
import { Field } from "./Field";
import { useFormGuard } from "./useFormGuard";

export function CateringForm() {
  const { lang, t } = useI18n();
  const c = t.catering;
  const { field: honeypot, guard } = useFormGuard();
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [type, setType] = useState(c.types[0]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    setState("sending");
    try {
      const res = await fetch("/api/forms/catering", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...data, ...guard(), type, lang }),
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

  return (
    <form onSubmit={submit} className="glass relative grid gap-4 p-6 sm:grid-cols-2 md:p-8">
      {honeypot}
      <Field label={c.name} id="e-name" required>
        <input id="e-name" name="name" required className="field" autoComplete="name" />
      </Field>
      <Field label={c.phone} id="e-phone" required>
        <input id="e-phone" name="phone" type="tel" required className="field" autoComplete="tel" />
      </Field>
      <Field label={c.email} id="e-email" required className="sm:col-span-2">
        <input id="e-email" name="email" type="email" required className="field" autoComplete="email" />
      </Field>
      <Field label={c.date} id="e-date">
        <input id="e-date" name="date" type="date" className="field [color-scheme:dark]" />
      </Field>
      <Field label={c.guests} id="e-guests">
        <input id="e-guests" name="guests" type="number" min={10} max={5000} inputMode="numeric" className="field" />
      </Field>
      <fieldset className="sm:col-span-2">
        <legend className="label">{c.type}</legend>
        <div className="flex flex-wrap gap-2">
          {c.types.map((v) => (
            <label key={v} className={`chip cursor-pointer ${type === v ? "chip-active" : ""}`}>
              <input type="radio" name="typeChoice" className="sr-only" checked={type === v} onChange={() => setType(v)} />
              {v}
            </label>
          ))}
        </div>
      </fieldset>
      <Field label={c.message} id="e-msg" className="sm:col-span-2">
        <textarea id="e-msg" name="message" rows={4} maxLength={2000} className="field resize-none" />
      </Field>
      {state === "error" && <p className="text-sm text-red-300 sm:col-span-2" role="alert">{t.common.error}</p>}
      <button type="submit" disabled={state === "sending"} className="btn-primary sm:col-span-2">
        {state === "sending" ? t.common.sending : t.common.send}
      </button>
    </form>
  );
}
