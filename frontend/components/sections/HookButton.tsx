"use client";

import { useState, type MouseEvent } from "react";
import { motion } from "motion/react";
import { useXWipe } from "@/components/ui/XWipe";
import { EASE_OUT } from "@/lib/motion";
import { blades, GLYPH_VIEWBOX } from "@/components/logo/geometry";
import { Bracket } from "@/components/ui/Bracket";

/**
 * The hook: a terminal command instead of a button.
 * Hover: brackets slide in, the mini X parts. Click: the command "runs", then the X wipe opens /join.
 */
export function HookButton() {
  const { navigate } = useXWipe();
  const [running, setRunning] = useState(false);

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    if (running) return;
    setRunning(true);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(() => navigate("/join"), reduce ? 0 : 1000);
  };

  const bracket =
    "hidden text-4xl leading-none text-ember transition-all duration-300 ease-[var(--ease-out-expo)] md:inline-block opacity-0 group-hover:opacity-100 group-focus-within:opacity-100";
  const part = "transition-transform duration-300 ease-[var(--ease-out-expo)]";

  return (
    <div className="group flex w-full items-center gap-3 sm:w-auto">
      <span aria-hidden className={`${bracket} translate-x-3 group-hover:translate-x-0 group-focus-within:translate-x-0`}>
        <Bracket side="open" />
      </span>
      <a
        href="/join"
        onClick={onClick}
        aria-label="Wanna have a look, join, or experience a session? Open the join form"
        className="relative flex h-16 w-full items-center gap-3.5 overflow-hidden rounded-full bg-dark pl-3 pr-5 font-mono text-[14px] text-on-dark transition-transform duration-150 active:scale-[0.98] sm:w-auto sm:gap-4 sm:pr-7 sm:text-[15px] md:h-20 md:pl-4 md:pr-9 md:text-xl"
      >
        <motion.span
          aria-hidden
          className="absolute inset-0 origin-left bg-ember"
          initial={false}
          animate={{ scaleX: running ? 1 : 0 }}
          transition={{ duration: 0.8, ease: EASE_OUT }}
        />
        <span
          aria-hidden
          className={`relative grid h-10 w-10 shrink-0 place-items-center rounded-full md:h-12 md:w-12 ${running ? "bg-dark" : "bg-dark-elevated"}`}
        >
          <svg viewBox={GLYPH_VIEWBOX} className="h-5 w-5 overflow-visible md:h-6 md:w-6">
            <g>
              <path d={blades.tl} className={`${part} fill-on-dark group-hover:-translate-x-[9px] group-hover:-translate-y-[10px]`} />
              <path d={blades.bl} className={`${part} fill-on-dark group-hover:-translate-x-[9px] group-hover:translate-y-[10px]`} />
              <path d={blades.tr} className={`${part} fill-ember group-hover:translate-x-[9px] group-hover:-translate-y-[10px]`} />
              <path d={blades.br} className={`${part} fill-ember group-hover:translate-x-[9px] group-hover:translate-y-[10px]`} />
            </g>
          </svg>
        </span>
        <span className="relative whitespace-nowrap">
          {running ? (
            <>→ opening portal...</>
          ) : (
            <>
              <span className="text-on-dark-soft">$</span> ./experience <span className="text-ember">--codexlab</span>
            </>
          )}
          <span aria-hidden className={`ml-1 animate-caret ${running ? "text-on-dark" : "text-ember"}`}>
            ▌
          </span>
        </span>
      </a>
      <span aria-hidden className={`${bracket} -translate-x-3 group-hover:translate-x-0 group-focus-within:translate-x-0`}>
        <Bracket side="close" />
      </span>
    </div>
  );
}
