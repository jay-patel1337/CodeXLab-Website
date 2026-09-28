"use client";

import { motion } from "motion/react";
import { EASE_OUT } from "@/lib/motion";
import { bladeEntry, blades, BRACE_W, braces, BRACKET_W, brackets, GLYPH_VIEWBOX, type BladeKey } from "./geometry";

const order: BladeKey[] = ["tl", "tr", "bl", "br"];
const tone: Record<BladeKey, string> = {
  tl: "fill-ink",
  bl: "fill-ink",
  tr: "fill-ember",
  br: "fill-ember",
};

/**
 * The "compile" X: four blades fly in from the corners and lock,
 * then the { } badge stamps into the crossing. Re-mount (change `key`) to replay.
 */
export function CompileMark({ className, delay = 0, slow = false }: { className?: string; delay?: number; slow?: boolean }) {
  // slow = the home intro: softer springs and a wider stagger so each blade is seen landing
  const step = slow ? 0.16 : 0.07;
  const spring = slow ? { stiffness: 110, damping: 17, mass: 1 } : { stiffness: 190, damping: 19, mass: 0.9 };
  const badgeAt = slow ? delay + 0.9 : delay + 0.55;
  return (
    <svg viewBox={GLYPH_VIEWBOX} className={className} aria-hidden overflow="visible">
      <g>
        {order.map((k, i) => {
          const from = bladeEntry[k];
          return (
            <motion.path
              key={k}
              d={blades[k]}
              className={tone[k]}
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
              initial={{ x: from.x, y: from.y, rotate: from.rotate, opacity: 0 }}
              animate={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
              transition={{
                type: "spring",
                ...spring,
                delay: delay + i * step,
                opacity: { duration: slow ? 0.35 : 0.2, delay: delay + i * step },
              }}
            />
          );
        })}
      </g>
      <motion.g
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
        fill="none"
        strokeWidth={BRACE_W}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: slow ? 200 : 320, damping: 16, delay: badgeAt }}
      >
        <path d={braces.left} className="stroke-ink" />
        <path d={braces.right} className="stroke-ember" />
      </motion.g>
    </svg>
  );
}

/** Bracket halves for the intro: "<" and "/>" slide in beside the X (same geometry as the mark). */
export function IntroBracket({ side, show, delay = 0 }: { side: "left" | "right"; show: boolean; delay?: number }) {
  const dx = side === "left" ? -24 : 24;
  const left = side === "left";
  return (
    <motion.svg
      viewBox={left ? "-15.4 42 18 22.8" : "109.6 39.7 29.4 26.8"}
      className={left ? "h-[min(7.4vmin,56px)] w-auto overflow-visible" : "h-[min(8.8vmin,66px)] w-auto overflow-visible"}
      aria-hidden
      initial={{ opacity: 0, x: dx }}
      animate={show ? { opacity: 1, x: 0 } : { opacity: 0, x: dx / 2 }}
      transition={{ duration: show ? 0.5 : 0.22, ease: EASE_OUT, delay: show ? delay : 0 }}
    >
      <g fill="none" strokeWidth={BRACKET_W} strokeLinecap="round" strokeLinejoin="round">
        {left ? (
          <path d={brackets.lt} className="stroke-ink" />
        ) : (
          <>
            <path d={brackets.slash} className="stroke-ember" />
            <path d={brackets.gt} className="stroke-ember" />
          </>
        )}
      </g>
    </motion.svg>
  );
}
