"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import { Badge } from "./LogoMark";
import { bladeDir, blades, GLYPH_VIEWBOX, type BladeKey } from "./geometry";

function Blade({ k, spread, className }: { k: BladeKey; spread: MotionValue<number>; className: string }) {
  const x = useTransform(spread, (s) => bladeDir[k].x * s);
  const y = useTransform(spread, (s) => bladeDir[k].y * s);
  return <motion.path d={blades[k]} className={className} style={{ x, y }} />;
}

/**
 * The X inside the hero wordmark. `spread` (glyph units) parts the blades
 * magnetically; GSAP targets .hx-left / .hx-right / .hx-core for the scroll split.
 */
export function HeroX({ spread }: { spread: MotionValue<number> }) {
  const ink = "fill-ink";
  const ember = "fill-ember";
  return (
    <svg viewBox={GLYPH_VIEWBOX} className="h-full w-full overflow-visible" aria-hidden>
      <g>
        <g className="hx-left">
          <Blade k="tl" spread={spread} className={ink} />
          <Blade k="bl" spread={spread} className={ink} />
        </g>
        <g className="hx-right">
          <Blade k="tr" spread={spread} className={ember} />
          <Blade k="br" spread={spread} className={ember} />
        </g>
      </g>
      <g className="hx-core">
        <Badge pulse />
      </g>
    </svg>
  );
}
