"use client";

import { animate, useMotionValue, useReducedMotion, useTransform, motion } from "framer-motion";
import { useEffect } from "react";
import { formatPrice } from "@/lib/menu";

export function AnimatedPrice({ value, lang, className = "" }: { value: number; lang: string; className?: string }) {
  const mv = useMotionValue(value);
  const reduce = useReducedMotion();
  const text = useTransform(mv, (v) => formatPrice(v, lang));
  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return;
    }
    const c = animate(mv, value, { duration: 0.45, ease: [0.2, 0.8, 0.2, 1] });
    return () => c.stop();
  }, [value, reduce, mv]);
  return (
    <motion.span className={`tabular-nums ${className}`} aria-live="polite">
      {text}
    </motion.span>
  );
}
