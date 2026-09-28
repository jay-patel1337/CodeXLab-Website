"use client";

import { useEffect, useRef } from "react";

/**
 * Keeps a raster element on whole device pixels. Flex layouts next to text often land an
 * image at x = 323.66px, which makes the browser resample it (soft edges, blurry lettering).
 * This measures the settled position and nudges it by the sub-pixel remainder using the
 * standalone `translate` property (so it never fights parent transforms).
 * Re-snaps on resize, zoom/DPR change, font load, and after any transition in `settleRoot` ends.
 */
export function usePixelSnap<T extends HTMLElement>(settleRoot?: () => HTMLElement | null) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;

    const snap = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.translate = "0px 0px";
        const r = el.getBoundingClientRect();
        const d = window.devicePixelRatio || 1;
        const dx = (Math.round(r.left * d) - r.left * d) / d;
        const dy = (Math.round(r.top * d) - r.top * d) / d;
        el.style.translate = `${dx.toFixed(4)}px ${dy.toFixed(4)}px`;
      });
    };

    snap();
    document.fonts?.ready.then(snap);
    window.addEventListener("resize", snap);
    const dpr = matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    dpr.addEventListener("change", snap);
    const root = settleRoot?.();
    root?.addEventListener("transitionend", snap);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", snap);
      dpr.removeEventListener("change", snap);
      root?.removeEventListener("transitionend", snap);
    };
  }, [settleRoot]);

  return ref;
}
