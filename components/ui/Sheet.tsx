"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icon";

/**
 * Bottom sheet on mobile, centered panel (or right drawer) on desktop.
 * Handles Esc, scroll lock and initial focus.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
  side = "center",
  closeLabel = "Close",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  side?: "center" | "right";
  closeLabel?: string;
}) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const id = window.setTimeout(() => panel.current?.focus(), 30);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      window.clearTimeout(id);
      prev?.focus?.();
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  const desktop =
    side === "right"
      ? "md:inset-y-0 md:right-0 md:left-auto md:top-0 md:h-full md:max-h-none md:w-[440px] md:rounded-none md:rounded-l-3xl"
      : "md:inset-x-auto md:left-1/2 md:top-1/2 md:bottom-auto md:w-[560px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl md:max-h-[86vh]";

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]">
          <motion.button
            type="button"
            aria-label={closeLabel}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <div className={`absolute inset-x-0 bottom-0 flex h-auto max-h-[92dvh] flex-col ${desktop}`}>
            <motion.div
              ref={panel}
              role="dialog"
              aria-modal="true"
              aria-label={title}
              tabIndex={-1}
              className="glass-strong flex max-h-full min-h-0 flex-1 flex-col overflow-hidden rounded-b-none rounded-t-3xl outline-none md:rounded-[inherit]"
              initial={{ y: side === "right" ? 0 : 60, x: side === "right" ? 40 : 0, opacity: 0 }}
              animate={{ y: 0, x: 0, opacity: 1 }}
              exit={{ y: side === "right" ? 0 : 60, x: side === "right" ? 40 : 0, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 320 }}
            >
              <div className="flex items-center justify-between gap-4 border-b border-black/5 px-5 py-4">
                <span className="mx-auto h-1 w-10 rounded-full bg-black/15 md:hidden absolute left-1/2 top-2 -translate-x-1/2" />
                <h2 className="heading text-2xl">{title}</h2>
                <button type="button" onClick={onClose} className="rounded-full p-2 text-cream-muted hover:bg-black/10 hover:text-cream" aria-label={closeLabel}>
                  <Icon name="x" />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">{children}</div>
              {footer && <div className="border-t border-black/5 bg-ink-800/90 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">{footer}</div>}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
