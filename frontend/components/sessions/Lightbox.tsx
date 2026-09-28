"use client";

/* eslint-disable @next/next/no-img-element -- remote images from the Sheet */
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { EASE_OUT } from "@/lib/motion";

/** Full-screen photo viewer: arrows / swipe-free keyboard nav, Esc to close, focus returns on close. */
export function Lightbox({ photos, start, title, onClose }: { photos: string[]; start: number; title: string; onClose: () => void }) {
  const [i, setI] = useState(start);
  const closeRef = useRef<HTMLButtonElement>(null);
  const opener = useRef<Element | null>(null);
  const go = useCallback((step: number) => setI((n) => (n + step + photos.length) % photos.length), [photos.length]);

  useEffect(() => {
    opener.current = document.activeElement;
    closeRef.current?.focus();
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      (opener.current as HTMLElement | null)?.focus?.();
    };
  }, [go, onClose]);

  const btn =
    "grid h-12 w-12 place-items-center rounded-full border border-dark-hairline bg-dark-elevated text-on-dark transition-colors hover:border-ember hover:text-ember";

  return createPortal(
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`${title}: photos`}
      className="fixed inset-0 z-[95] flex flex-col bg-dark/95"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex items-center justify-between gap-4 px-5 py-4 font-mono text-sm text-on-dark-soft md:px-10">
        <span className="truncate">
          <span className="text-ember">$</span> open {title}
        </span>
        <span className="flex items-center gap-4">
          <span>
            {String(i + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
          </span>
          <button ref={closeRef} type="button" onClick={onClose} className={btn} aria-label="Close photos">
            ✕
          </button>
        </span>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-8 md:px-24" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.img
            key={photos[i]}
            src={photos[i]}
            alt={`${title}, photo ${i + 1}`}
            referrerPolicy="no-referrer"
            className="max-h-full max-w-full rounded-xl object-contain"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
          />
        </AnimatePresence>
        {photos.length > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} className={`${btn} absolute left-4 top-1/2 -translate-y-1/2 md:left-8`} aria-label="Previous photo">
              ←
            </button>
            <button type="button" onClick={() => go(1)} className={`${btn} absolute right-4 top-1/2 -translate-y-1/2 md:right-8`} aria-label="Next photo">
              →
            </button>
          </>
        )}
      </div>
    </motion.div>,
    document.body,
  );
}
