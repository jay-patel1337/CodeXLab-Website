"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { LogoMark } from "@/components/logo/LogoMark";
import { SouLockup } from "@/components/logo/SouLockup";
import { blades, GLYPH_VIEWBOX } from "@/components/logo/geometry";
import { useXWipe } from "@/components/ui/XWipe";
import { SectionLink } from "@/components/ui/SectionJump";
import { Bracket } from "@/components/ui/Bracket";
import { EASE_OUT, EASE_SOFT } from "@/lib/motion";
import { nav, site } from "@/lib/site";

export function Nav() {
  const [compact, setCompact] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { navigate } = useXWipe();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });
  const wordRef = useRef<HTMLSpanElement>(null);
  const [shift, setShift] = useState(0);
  const headerRef = useRef<HTMLElement>(null);
  const settleRoot = useCallback(() => headerRef.current, []);

  // How far the SOU lockup slides left when the CodeXLab wordmark folds (wordmark width + gap).
  useEffect(() => {
    const el = wordRef.current;
    if (!el) return;
    // Rounded to whole device pixels so the slid logo lands crisp, not between pixels.
    const measure = () => {
      const d = window.devicePixelRatio || 1;
      const w = el.getBoundingClientRect().width; // 0 on phones, where the wordmark isn't shown
      const raw = w ? w + parseFloat(getComputedStyle(el.parentElement!).columnGap || "0") : 0;
      setShift(Math.round(raw * d) / d);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  // Compact styling only while the mobile menu is closed.
  const small = compact && !open;
  const glide = "transition-[transform,translate,scale,opacity] duration-500 ease-[var(--ease-out-expo)]";

  return (
    <header ref={headerRef} className="fixed inset-x-0 top-0 z-50">
      <div className="relative">
        {/*
          Everything below animates transform/opacity only (no height/width/blur),
          so it stays smooth even while the pinned hero scene is scrubbing.
          The bar keeps a fixed layout height; its background shrinks with scaleY.
        */}
        <div
          aria-hidden
          className={`absolute inset-x-0 top-0 h-[72px] origin-top border-b border-hairline bg-canvas ${glide} md:h-[96px] ${
            compact || open ? "opacity-100" : "opacity-0"
          } ${small ? "scale-y-[0.8334]" : ""}`}
        >
          <motion.div className="absolute inset-x-0 -bottom-px h-[2px] origin-left bg-ember" style={{ scaleX: progress }} />
        </div>

        <nav
          aria-label="Main"
          className={`relative mx-auto flex h-[72px] max-w-[1400px] items-center justify-between gap-3 px-5 md:h-[96px] md:px-10 ${glide} ${
            small ? "-translate-y-[6px] md:-translate-y-[8px]" : ""
          }`}
        >
          {/* No scaling here: scaled rasters resample and go soft. Only the wordmark folds and the SOU lockup slides. */}
          <div className="flex min-w-0 items-center">
            <SectionLink href="/#top" aria-label="CodeXLab home" className="flex shrink-0 items-center gap-2.5 text-ink md:gap-3">
              <LogoMark variant="mark" className="h-9 w-auto md:h-[3.25rem]" />
              <span
                ref={wordRef}
                aria-hidden={small}
                // phones: the mark alone (the hero spells the name out huge), which makes room for the Join button
                className={`hidden whitespace-nowrap font-display text-xl font-bold tracking-[-0.04em] sm:inline md:text-[1.8rem] ${glide} ${
                  small ? "pointer-events-none -translate-x-3 opacity-0" : ""
                }`}
              >
                Code<span className="text-ember">X</span>Lab
              </span>
            </SectionLink>
            {/* Slides left over the folded wordmark: a transform, not a width change. */}
            <div className={`flex items-center ${glide}`} style={{ transform: small ? `translateX(${-shift}px)` : undefined }}>
              <span aria-hidden className="mx-3 h-8 w-px shrink-0 bg-hairline md:mx-6 md:h-12" />
              <a href={site.universityUrl} target="_blank" rel="noreferrer" className="shrink-0" title="Silver Oak University">
                <SouLockup settleRoot={settleRoot} />
              </a>
            </div>
          </div>

          <div className="hidden shrink-0 items-center gap-8 lg:flex">
            {nav.map((item) => (
              <SectionLink key={item.href} href={item.href} className="text-sm font-medium text-body transition-colors hover:text-ink">
                {item.label}
              </SectionLink>
            ))}
            <JoinButton onClick={() => navigate("/join")} />
          </div>

          <div className="flex shrink-0 items-center gap-2 lg:hidden">
            {pathname !== "/join" && <PhoneJoin />}
            <button
              type="button"
              className="-mr-2 grid h-11 w-11 shrink-0 place-items-center rounded-lg text-ink"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((o) => !o)}
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}
              </svg>
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {open && (
            <>
              {/* backdrop: dims the page and closes the menu on tap (behind the bar, inside the header's layer) */}
              <motion.button
                key="backdrop"
                type="button"
                aria-label="Close menu"
                tabIndex={-1}
                onClick={() => setOpen(false)}
                className="fixed inset-0 -z-10 touch-none bg-ink/25 lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: EASE_OUT }}
              />
              <motion.div
                key="menu"
                id="mobile-menu"
                className="relative overflow-hidden border-b border-hairline bg-canvas lg:hidden"
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0, transition: { duration: 0.3, ease: EASE_OUT } }}
                transition={{ duration: 0.45, ease: EASE_SOFT }}
              >
                <div className="flex flex-col px-5 pb-6 pt-2">
                  {[...nav, { label: "Join", href: "/join" }].map((item, i) => {
                    const join = item.href === "/join";
                    return (
                      // each link drifts in a beat after the one above it
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: EASE_SOFT, delay: 0.08 + i * 0.05 }}
                      >
                        <SectionLink
                          href={item.href}
                          onNavigate={() => setOpen(false)}
                          className={`flex items-baseline gap-3 py-3 font-display text-2xl font-semibold transition-opacity active:opacity-60 ${join ? "text-ember-text" : "text-ink"}`}
                        >
                          <span className="font-mono text-xs font-normal text-muted">{String(i + 1).padStart(2, "0")}</span>
                          {/* Join is written as a whole tag, <Join/>, like the section titles (a lone "/>" read as a typo).
                              One inline run, so the brackets sit on the word's baseline; spacing as in TagHeading. */}
                          <span>
                            {join && <Bracket side="open" weight={13} className="mr-[0.05em]" />}
                            {item.label}
                            {join && <Bracket side="close" weight={13} className="ml-[0.07em]" />}
                          </span>
                        </SectionLink>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

/**
 * Below lg the full "Join the club" button doesn't fit, so phones and tablets get this compact one beside
 * the menu button: same dark pill and X, a tap state instead of the hover roll, and a 44px hit area.
 */
function PhoneJoin() {
  return (
    <SectionLink
      href="/join"
      aria-label="Join the club"
      className="relative inline-flex h-9 items-center gap-1.5 rounded-lg bg-ink pl-2.5 pr-3 text-sm font-medium text-canvas transition-[background-color,transform,scale] duration-150 after:absolute after:-inset-1 active:scale-[0.96] active:bg-dark"
    >
      <svg viewBox={GLYPH_VIEWBOX} aria-hidden className="h-3.5 w-3.5">
        <path d={blades.tl} className="fill-canvas" />
        <path d={blades.bl} className="fill-canvas" />
        <path d={blades.tr} className="fill-ember" />
        <path d={blades.br} className="fill-ember" />
      </svg>
      Join
    </SectionLink>
  );
}

/**
 * Hover (and keyboard focus): the X stays put; the label rolls up into its tag form, <Join/>,
 * with a live caret, and an ember scan line sweeps the bottom edge. Transform/opacity only.
 */
function JoinButton({ onClick }: { onClick: () => void }) {
  const roll = "block transition-[transform,translate,opacity] duration-500 ease-[var(--ease-out-expo)]";
  const on = "group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Join the club"
      className="group relative inline-flex h-10 items-center gap-2 overflow-hidden rounded-lg bg-ink pl-3 pr-4 text-sm font-medium text-canvas transition-[background-color,transform,scale] duration-150 hover:bg-dark active:scale-[0.98]"
    >
      <svg viewBox={GLYPH_VIEWBOX} aria-hidden className="h-3.5 w-3.5">
        <path d={blades.tl} className="fill-canvas" />
        <path d={blades.bl} className="fill-canvas" />
        <path d={blades.tr} className="fill-ember" />
        <path d={blades.br} className="fill-ember" />
      </svg>
      <span aria-hidden className="relative block h-5 overflow-hidden leading-5">
        <span className={`${roll} group-hover:-translate-y-full group-hover:opacity-0 group-focus-visible:-translate-y-full group-focus-visible:opacity-0`}>
          Join the club
        </span>
        <span className={`${roll} absolute inset-0 translate-y-full whitespace-nowrap font-mono text-[13px] opacity-0 group-hover:delay-75 ${on}`}>
          <Bracket side="open" weight={13} className="text-ember" />
          Join
          <Bracket side="close" weight={13} className="text-ember" />
          <span className="ml-1 animate-caret text-ember">▌</span>
        </span>
      </span>
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-ember transition-[transform,scale] duration-500 ease-[var(--ease-out-expo)] group-hover:scale-x-100 group-focus-visible:scale-x-100"
      />
    </button>
  );
}
