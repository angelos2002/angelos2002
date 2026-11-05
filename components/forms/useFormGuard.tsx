"use client";

import { useRef } from "react";

/** Timestamp + honeypot field for basic bot protection on public forms. */
export function useFormGuard() {
  const t = useRef(Date.now());
  const honeypot = useRef<HTMLInputElement>(null);
  const field = (
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Website
        <input ref={honeypot} type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
  return { field, guard: () => ({ t: t.current, website: honeypot.current?.value ?? "" }) };
}
