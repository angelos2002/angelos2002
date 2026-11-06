"use client";

import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import { Icon } from "@/components/ui/Icon";
import { EXPLODED, LAYERS, STACKED } from "./BurgerLayers";

const STACK_END = 0.72;
const stackedCenter = (STACKED[STACKED.length - 1] + LAYERS[LAYERS.length - 1].h) / 2;
const explodedCenter = (EXPLODED[0] + EXPLODED[EXPLODED.length - 1] + LAYERS[LAYERS.length - 1].h) / 2;

function Layer({ i, progress, showLabel, label }: { i: number; progress: MotionValue<number>; showLabel: boolean; label: string }) {
  const layer = LAYERS[i];
  const y = useTransform(progress, [0, STACK_END], [EXPLODED[i] - explodedCenter, STACKED[i] - stackedCenter]);
  const rotate = useTransform(progress, [0, STACK_END], [(i % 2 ? 1 : -1) * (4 + i), 0]);
  const x = useTransform(progress, [0, STACK_END], [(i % 2 ? 1 : -1) * 10, 0]);
  const labelOpacity = useTransform(progress, [0, 0.3, 0.5], [1, 1, 0]);
  const labelX = useTransform(progress, [0, 0.5], [0, -20]);

  return (
    <motion.div className="absolute left-0 top-1/2 w-[360px]" style={{ y, x, rotate, zIndex: LAYERS.length - i }}>
      <div className="drop-shadow-[0_14px_18px_rgba(0,0,0,0.55)]">{layer.svg}</div>
      {showLabel && (
        <motion.div
          style={{ opacity: labelOpacity, x: labelX, top: layer.h / 2 }}
          className={`pointer-events-none absolute hidden -translate-y-1/2 items-center gap-3 whitespace-nowrap md:flex ${i % 2 ? "left-[calc(100%+12px)]" : "right-[calc(100%+12px)] flex-row-reverse"}`}
        >
          <span className="h-px w-12 bg-gradient-to-r from-flame/0 via-flame to-flame/0" />
          <span className="glass rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cream">{label}</span>
        </motion.div>
      )}
    </motion.div>
  );
}

export function ExplodingBurger() {
  const { lang, t } = useI18n();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.4 });
  const done = useMotionValue(1);
  const progress = reduce ? done : smooth;

  const introOpacity = useTransform(progress, [0, 0.35], [1, 0]);
  const introY = useTransform(progress, [0, 0.35], [0, -40]);
  const outroOpacity = useTransform(progress, [0.68, 0.85], [0, 1]);
  const outroY = useTransform(progress, [0.68, 0.85], [30, 0]);
  const glow = useTransform(progress, [0, STACK_END, 1], [0.35, 0.9, 1]);
  const burgerScale = useTransform(progress, [0, STACK_END, 1], [0.92, 1.04, 1]);
  const hintOpacity = useTransform(progress, [0, 0.1], [1, 0]);

  return (
    <section ref={ref} className={reduce ? "relative" : "relative h-[260vh] md:h-[300vh]"} aria-label={t.home.builtTitle}>
      <div className="sticky top-0 flex h-[100svh] min-h-[600px] items-center overflow-hidden">
        {/* ambient */}
        <motion.div style={{ opacity: glow }} className="pointer-events-none absolute left-1/2 top-[58%] h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-flame/40 blur-[100px] md:left-[62%] md:top-1/2" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_70%,#ffffff)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(0,0,0,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,.6)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />

        <div className="container-x relative grid h-full grid-rows-[auto_1fr] items-center gap-4 pt-20 md:grid-cols-[1fr_1.1fr] md:grid-rows-1 md:pt-16">
          {/* Copy */}
          <div className="relative z-10 min-h-[190px] md:min-h-[360px]">
            {!reduce && (
              <motion.div style={{ opacity: introOpacity, y: introY }} className="absolute inset-x-0 top-0">
                <p className="kicker">{t.home.kicker}</p>
                <h1 className="heading mt-3 text-[clamp(3rem,12vw,7.5rem)]">
                  {t.home.title1}
                  <br />
                  <span className="text-flame neon-text">{t.home.title2}</span>
                </h1>
                <p className="mt-4 hidden max-w-md text-lg text-cream-muted sm:block">{t.home.sub}</p>
              </motion.div>
            )}
            <motion.div style={reduce ? undefined : { opacity: outroOpacity, y: outroY }} className={reduce ? "" : "absolute inset-x-0 top-0"}>
              <p className="kicker">{t.home.kicker}</p>
              <h2 className="heading mt-3 text-[clamp(3rem,12vw,7.5rem)]">
                <span className="text-flame neon-text">{t.home.builtTitle}</span>
              </h2>
              <p className="mt-4 max-w-md text-base text-cream-muted sm:text-lg">{t.home.builtSub}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={`/${lang}/menu`} className="btn-primary px-8 py-4 text-xl">
                  {t.common.orderNow} <Icon name="arrowRight" />
                </Link>
                <Link href={`/${lang}/locations`} className="btn-ghost hidden sm:inline-flex">
                  {t.nav.locations}
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Burger */}
          <div className="relative flex h-full items-center justify-center">
            <div className="relative h-[360px] w-[360px] origin-center scale-[0.62] min-[400px]:scale-[0.7] sm:scale-90 md:scale-100">
              <motion.div style={{ scale: burgerScale }} className="absolute inset-0 origin-center">
                {LAYERS.map((l, i) => (
                  <Layer key={l.id} i={i} progress={progress} showLabel={!reduce} label={t.home.layers[i]} />
                ))}
              </motion.div>
            </div>
          </div>
        </div>

        {!reduce && (
          <motion.div style={{ opacity: hintOpacity }} className="absolute bottom-[calc(var(--mobile-bar)+1.25rem)] left-1/2 hidden md:flex -translate-x-1/2 flex-col items-center gap-2 text-xs uppercase tracking-[0.3em] text-cream-dim">
            {t.home.scrollHint}
            <motion.span animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.6 }}>
              <Icon name="chevronDown" className="h-5 w-5 text-flame" />
            </motion.span>
          </motion.div>
        )}
      </div>
    </section>
  );
}
