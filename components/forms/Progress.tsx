"use client";

import { motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";

export function Progress({ steps, current, label }: { steps: string[]; current: number; label?: string }) {
  const pct = steps.length > 1 ? (current / (steps.length - 1)) * 100 : 100;
  return (
    <div>
      {label && <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-cream-dim">{label}</p>}
      <div
        className="relative h-1.5 overflow-hidden rounded-full bg-black/10"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-valuenow={current + 1}
        aria-valuetext={steps[current]}
      >
        <motion.div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-flame-600 to-ember shadow-glow-sm" animate={{ width: `${pct}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
      </div>
      <ol className="mt-3 flex justify-between gap-1">
        {steps.map((s, i) => (
          <li key={s} className={`flex items-center gap-1.5 text-xs ${i <= current ? "text-cream" : "text-cream-dim"}`}>
            <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-bold ${i < current ? "bg-flame text-onaccent" : i === current ? "border border-flame text-flame" : "border border-black/15"}`}>
              {i < current ? <Icon name="check" className="h-3 w-3" /> : i + 1}
            </span>
            <span className={`hidden sm:inline ${i === current ? "font-semibold" : ""}`}>{s}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
