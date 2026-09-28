"use client";

import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { AnimatePresence, LayoutGroup, motion, useMotionValue, useSpring } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { CompileMark, IntroBracket } from "@/components/logo/CompileMark";
import { HeroX } from "@/components/logo/HeroX";
import { LogoMark } from "@/components/logo/LogoMark";
import { TypeLine } from "@/components/ui/TypeLine";
import { EASE_OUT } from "@/lib/motion";
import { LETTER_SLOT, SlotParts, X_SLOT } from "./SlotParts";
import { useWordLoop } from "./useWordLoop";

type Phase = "intro" | "leaving" | "done";
export const INTRO_KEY = "cx-intro-seen";

/** Intro choreography (seconds unless noted). Slow enough to be felt, ~3.4s to the hero. */
const INTRO = {
  blades: 0.25, // first blade; each next +0.16
  brackets: 1.5,
  club: 1.9,
  leave: 3000, // ms: brackets + CODING CLUB fade
  done: 3350, // ms: X flies into the wordmark
  fly: 1.1, // X flight into the wordmark
} as const;

/**
 * One half of the wordmark. Entrance: the word unfolds out of the X. Each letter slides away from it,
 * nearest first, so the X reads as the core everything compiles out of (the scroll split is the reverse).
 * Hover (mouse): the letter lifts a hair and prints its character code above it: "Code" is 0x43 0x6F 0x64 0x65.
 */
function Letters({ text, className, play, side, start }: { text: string; className: string; play: boolean; side: "left" | "right"; start: number }) {
  const chars = [...text];
  return (
    <span aria-hidden className={`inline-block ${className}`}>
      {chars.map((ch, i) => {
        const step = side === "left" ? chars.length - 1 - i : i; // 0 = next to the X
        const from = `${(side === "left" ? 1 : -1) * (0.14 + step * 0.09)}em`; // start tucked toward the X
        return (
          <span
            key={i}
            data-slot
            className={`group/l relative inline-block ${play ? "hero-unfold" : ""}`}
            style={{ ...LETTER_SLOT, ["--from" as string]: from, ["--delay" as string]: `${0.35 + step * 0.13}s` }}
          >
            <SlotParts i={start + i} />
            <span data-glyph data-i={start + i} className="relative inline-block transition-[translate] duration-700 ease-soft group-hover/l:-translate-y-[0.03em]">
              {ch}
            </span>
            <span className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 translate-y-1 font-mono text-[clamp(10px,0.05em,15px)] font-medium tracking-normal text-ember-text opacity-0 transition-[opacity,translate] duration-700 ease-soft group-hover/l:translate-y-0 group-hover/l:opacity-100">
              0x{ch.charCodeAt(0).toString(16).toUpperCase()}
            </span>
          </span>
        );
      })}
    </span>
  );
}

export function Hero() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [played, setPlayed] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const xSlotRef = useRef<HTMLSpanElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);
  const pushRef = useRef<HTMLDivElement>(null);
  const target = useMotionValue(0);
  const spread = useSpring(target, { stiffness: 220, damping: 16 });

  // 1. Intro: blades compile in the overlay, then the X flies into the wordmark.
  useEffect(() => {
    const root = document.documentElement;
    if (root.classList.contains("skip-intro")) {
      setPhase("done");
      return;
    }
    setPlayed(true);
    root.style.overflow = "hidden";
    const t1 = setTimeout(() => setPhase("leaving"), INTRO.leave);
    const t2 = setTimeout(() => {
      setPhase("done");
      root.style.overflow = "";
      try {
        sessionStorage.setItem(INTRO_KEY, "1");
      } catch {}
    }, INTRO.done);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      root.style.overflow = "";
    };
  }, []);

  // 2. Scroll: split the X. Graphite half left, ember half right, dark panel opens through the gap.
  useEffect(() => {
    if (phase !== "done" || !sectionRef.current) return;
    gsap.registerPlugin(ScrollTrigger);
    // Phones: the browser toolbar sliding away is a "resize"; re-measuring the pin then made it jump.
    ScrollTrigger.config({ ignoreMobileResize: true });
    const mm = gsap.matchMedia();
    mm.add(
      "(prefers-reduced-motion: no-preference)",
      () => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "+=110%",
            scrub: 0.6,
            pin: true,
            anticipatePin: 1,
          },
        });
        tl.to(".hx-core", { scale: 0, opacity: 0, svgOrigin: "60 55", duration: 0.18 }, 0)
          .to(".hx-left", { x: -260, duration: 1 }, 0)
          .to(".hx-right", { x: 260, duration: 1 }, 0)
          .to(".hw-left", { xPercent: -140, duration: 1 }, 0)
          .to(".hw-right", { xPercent: 140, duration: 1 }, 0)
          .to(".hero-fade", { opacity: 0, y: -24, duration: 0.3 }, 0)
          .fromTo(".hero-reveal", { scaleX: 0.052 }, { scaleX: 1, duration: 0.7, ease: "power1.in" }, 0.3)
          .set(".hero-reveal", { visibility: "visible" }, 0.3)
          .fromTo(".hero-reveal-text", { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.25 }, 0.75);
      },
      sectionRef,
    );
    // The pin adds scroll distance above later sections, so a hash jump that happened
    // before it existed (e.g. /join → /#sessions) now points mid-split. Re-land it.
    const raf = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      const el = location.hash ? document.querySelector(location.hash) : null;
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: "instant" });
    });
    // Content below may shift once fonts/images settle.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("load", refresh);
      mm.revert();
    };
  }, [phase]);

  // The scroll cue glides down through the split (so the signature moment plays) instead of jumping.
  const scrollDown = (e: MouseEvent<HTMLAnchorElement>) => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    e.preventDefault();
    gsap.registerPlugin(ScrollToPlugin);
    gsap.to(window, { scrollTo: { y: "#sessions", autoKill: true }, duration: 2.2, ease: "power2.inOut" });
  };

  // Magnetic: blades part as a mouse approaches the X.
  const onPointerMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse" || !xSlotRef.current) return;
    const r = xSlotRef.current.getBoundingClientRect();
    const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
    const radius = Math.max(220, r.width * 2.4);
    target.set(Math.max(0, 1 - d / radius) * 9);
  };

  const done = phase === "done";
  // The data-structure loop: first run once the word has settled (the unfold takes ~2.5s after the intro).
  useWordLoop(wordRef, pushRef, done, played ? 5 : 3);

  return (
    <LayoutGroup>
      {/* React owns this wrapper; GSAP's pin-spacer wraps the inner <section>, so unmounting stays safe. */}
      <div>
        <section
          ref={sectionRef}
          id="top"
          aria-label="CodeXLab"
          onPointerMove={onPointerMove}
          onPointerLeave={() => target.set(0)}
          className="hero-h relative isolate flex min-h-[560px] flex-col overflow-hidden bg-canvas"
        >
          <div aria-hidden className="code-grid absolute inset-0 -z-10" />
  
          <div className="flex flex-1 flex-col items-center justify-center px-4 pt-24">
            {/* The word + the loop's caption line (typed above it while the data-structure loop runs). */}
            <div ref={wordRef} className="relative">
              <p aria-hidden data-cap className="pointer-events-none absolute bottom-full left-0 whitespace-nowrap font-mono text-[clamp(11px,1.05vw,15px)] text-body opacity-0">
                <span data-cap-op />
                <span data-cap-res className="text-ember-text" />
                <span className="ml-0.5 animate-caret text-ember">▌</span>
              </p>
            <h1
              aria-label="CodeXLab"
              // tracking: at -0.055em the bowls of o/d/e touched. items-baseline + h-[0.72em]: the X stands on
              // the baseline and tops out at cap height, like the L beside it. ml > mr evens out the ink gaps
              // (the "e" ends flush with its box, the "L" carries a wide left side bearing).
              // size: 19vw, but never wider than the screen minus its 1rem gutters (the word is 4.86em wide)
              className="flex select-none items-baseline whitespace-nowrap font-display text-[clamp(3.4rem,min(19vw,calc((100vw_-_2rem)/4.9)),19rem)] font-bold leading-[0.8] tracking-[-0.02em] text-ink"
            >
              <Letters text="Code" className="hw-left will-change-transform" play={done && played} side="left" start={0} />
              <span ref={xSlotRef} data-slot data-x className="relative ml-[0.05em] mr-[0.01em] inline-block h-[0.72em] w-[0.78em]" style={X_SLOT}>
                <SlotParts i={4} />
                {done ? (
                  <motion.span
                    layoutId={played ? "cx-x" : undefined}
                    className="absolute inset-0 block"
                    transition={{ duration: INTRO.fly, ease: EASE_OUT }}
                  >
                    <HeroX spread={spread} />
                  </motion.span>
                ) : (
                  <LogoMark variant="glyph" className="hero-x-placeholder absolute inset-0 h-full w-full" />
                )}
              </span>
              <Letters text="Lab" className="hw-right will-change-transform" play={done && played} side="right" start={5} />
            </h1>
            </div>

            {/* The loop nudges this down while array indices hang under the word. */}
            <div ref={pushRef}>
              <TypeLine
                className="hero-fade will-change-[transform,opacity] mt-[clamp(1.5rem,4vw,3rem)] min-h-[1.6em] text-center font-mono text-[clamp(0.95rem,1.7vw,1.35rem)] text-body"
                start={done && played}
                delay={1500}
                speed={50}
                segments={[{ text: "Har Line of Code, " }, { text: "SOU", accent: true }, { text: " Ke Mode." }]}
              />
            </div>
          </div>
  
          <div className="hero-fade will-change-[transform,opacity] mx-auto flex w-full max-w-[1400px] items-end justify-between gap-4 px-5 pb-6 font-mono text-xs uppercase tracking-[0.22em] text-muted md:px-10">
            {/* phones: two lines, so the university name fits too */}
            <span className="flex flex-col gap-1.5 sm:block">
              {"// Coding Club"}
              <span className="whitespace-nowrap">
                <span className="hidden sm:inline">{" · "}</span>Silver Oak University
              </span>
            </span>
            {/* the ::after pad gives the small label a thumb-sized hit area without moving anything;
                phones get the short form so the university name keeps one line */}
            <a
              href="#sessions"
              onClick={scrollDown}
              aria-label="Scroll down"
              className="relative shrink-0 transition-colors after:absolute after:-inset-x-3 after:-inset-y-4 hover:text-ember-text"
            >
              <span aria-hidden className="sm:hidden">
                scroll <span className="inline-block animate-bounce text-ember [animation-duration:2.4s]">↓</span>
              </span>
              <span aria-hidden className="hidden sm:inline">
                scroll --down <span className="animate-caret">_</span>
              </span>
            </a>
          </div>
  
          {/* Curtain: a scaleX transform (GPU-composited), not a clip-path (repaints every frame). */}
          <div
            aria-hidden
            className="hero-reveal pointer-events-none absolute inset-y-0 left-[-8%] right-[-8%] z-10 origin-center bg-dark"
            style={{ transform: "scaleX(0.052)", visibility: "hidden", willChange: "transform" }}
          />
          <div aria-hidden className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
            <p className="hero-reveal-text font-mono text-[clamp(1rem,2.4vw,1.6rem)] text-on-dark" style={{ opacity: 0 }}>
              <span className="text-ember">$</span> git log <span className="text-on-dark-soft">--sessions</span>
              <span className="ml-1 animate-caret text-ember">▌</span>
            </p>
          </div>
        </section>
      </div>

      <AnimatePresence>
        {!done && (
          <motion.div
            key="intro-bg"
            aria-hidden
            className="intro-overlay fixed inset-0 z-[60] bg-canvas"
            exit={{ opacity: 0, transition: { duration: 0.9, ease: EASE_OUT } }}
          >
            <div className="code-grid absolute inset-0" />
          </motion.div>
        )}
      </AnimatePresence>

      {!done && (
        <div aria-hidden className="intro-overlay pointer-events-none fixed inset-0 z-[61] grid place-items-center">
          <div className="flex flex-col items-center gap-[4vmin]">
            {/* The X is the row's only in-flow child, so it shares the true centre line with CODING CLUB.
                The brackets hang off its sides: "<" is narrower than "/>", and as flex siblings they pushed the X left. */}
            <div className="relative">
              <span className="absolute right-full top-1/2 mr-[2.5vmin] flex -translate-y-1/2">
                <IntroBracket side="left" show={phase === "intro"} delay={INTRO.brackets} />
              </span>
              <motion.span layoutId="cx-x" className="block aspect-[128/118] w-[min(40vmin,300px)]">
                <CompileMark className="h-full w-full overflow-visible" delay={INTRO.blades} slow />
              </motion.span>
              <span className="absolute left-full top-1/2 ml-[2.5vmin] flex -translate-y-1/2">
                <IntroBracket side="right" show={phase === "intro"} delay={INTRO.brackets + 0.1} />
              </span>
            </div>
            <motion.div
              className="flex items-center gap-4 font-mono text-[clamp(0.7rem,1.6vmin,0.95rem)] font-medium uppercase tracking-[0.6em] text-ink"
              initial={{ opacity: 0 }}
              animate={{ opacity: phase === "intro" ? 1 : 0 }}
              transition={{ duration: phase === "intro" ? 0.7 : 0.25, delay: phase === "intro" ? INTRO.club : 0 }}
            >
              <motion.span
                className="block h-[2px] w-[8vmin] origin-right bg-ember"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.7, ease: EASE_OUT, delay: INTRO.club }}
              />
              <span className="pl-[0.6em]">Coding Club</span>
              <motion.span
                className="block h-[2px] w-[8vmin] origin-left bg-ember"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.7, ease: EASE_OUT, delay: INTRO.club }}
              />
            </motion.div>
          </div>
        </div>
      )}
    </LayoutGroup>
  );
}
