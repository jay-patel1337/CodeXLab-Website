"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { animate } from "motion/react";
import { useXWipe } from "./XWipe";

type Ctx = { jump: (hash: string) => void };
const JumpContext = createContext<Ctx>({ jump: () => {} });
export const useSectionJump = () => useContext(JumpContext);

const SHUT = [0.76, 0, 0.24, 1] as const; // in-out quart: a shutter, not a fade
const OPEN = [0.16, 1, 0.3, 1] as const;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * In-page section jumps as an "X shutter": four dark triangles close in from the screen edges
 * (their seams draw the ember X), a terminal types `cd ~/section`, the page jumps underneath,
 * and the shutter opens onto the section. Transform/opacity only.
 */
export function SectionJumpProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false);
  const [cmd, setCmd] = useState("");
  const busy = useRef(false);
  const panels = useRef<(HTMLDivElement | null)[]>([]);
  const lines = useRef<SVGGElement>(null);
  const card = useRef<HTMLDivElement>(null);

  const jump = useCallback(async (hash: string) => {
    const target = hash === "#top" ? null : document.querySelector<HTMLElement>(hash);
    if (hash !== "#top" && !target) return;
    const land = () => {
      const y = target ? target.getBoundingClientRect().top + window.scrollY : 0;
      window.scrollTo({ top: y, behavior: "instant" });
      history.replaceState(null, "", hash === "#top" ? "/" : hash);
      if (target) {
        if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
    };

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return land();
    if (busy.current) return;
    busy.current = true;

    const name = hash === "#top" ? "~" : `~/${hash.slice(1)}`;
    setCmd("");
    setActive(true);
    await new Promise(requestAnimationFrame);

    const [top, right, bottom, left] = panels.current as HTMLDivElement[];
    const from = { top: { y: "-100%" }, bottom: { y: "100%" }, left: { x: "-100%" }, right: { x: "100%" } };

    // 1. close
    const closing = Promise.all([
      animate(top, { y: [from.top.y, "0%"] }, { duration: 0.7, ease: SHUT }),
      animate(bottom, { y: [from.bottom.y, "0%"] }, { duration: 0.7, ease: SHUT }),
      animate(left, { x: [from.left.x, "0%"] }, { duration: 0.7, ease: SHUT, delay: 0.07 }),
      animate(right, { x: [from.right.x, "0%"] }, { duration: 0.7, ease: SHUT, delay: 0.07 }),
      lines.current && animate(lines.current, { opacity: [0, 1] }, { duration: 0.4, delay: 0.45 }),
      card.current && animate(card.current, { opacity: [0, 1], scale: [0.96, 1] }, { duration: 0.5, delay: 0.48, ease: OPEN }),
    ]);
    // 2. type the command while it closes
    const full = `cd ${name}`;
    await wait(520);
    for (let i = 1; i <= full.length; i++) {
      setCmd(full.slice(0, i));
      await wait(36);
    }
    await closing;
    await wait(260);

    // 3. jump underneath
    land();
    await wait(90);

    // 4. open
    await Promise.all([
      card.current && animate(card.current, { opacity: 0, scale: 1.02 }, { duration: 0.35 }),
      lines.current && animate(lines.current, { opacity: 0 }, { duration: 0.3 }),
      animate(top, { y: "-100%" }, { duration: 0.95, ease: OPEN, delay: 0.08 }),
      animate(bottom, { y: "100%" }, { duration: 0.95, ease: OPEN, delay: 0.08 }),
      animate(left, { x: "-100%" }, { duration: 0.95, ease: OPEN }),
      animate(right, { x: "100%" }, { duration: 0.95, ease: OPEN }),
    ]);
    setActive(false);
    busy.current = false;
  }, []);

  const tri = [
    { clip: "polygon(0 0, 100% 0, 50% 50%)", bg: "bg-ink", init: "translateY(-100%)" },
    { clip: "polygon(100% 0, 100% 100%, 50% 50%)", bg: "bg-dark", init: "translateX(100%)" },
    { clip: "polygon(0 100%, 100% 100%, 50% 50%)", bg: "bg-ink", init: "translateY(100%)" },
    { clip: "polygon(0 0, 50% 50%, 0 100%)", bg: "bg-dark", init: "translateX(-100%)" },
  ];

  return (
    <JumpContext.Provider value={{ jump }}>
      {children}
      <div aria-hidden className={`fixed inset-0 z-[85] ${active ? "" : "hidden"}`}>
        {tri.map((t, i) => (
          <div
            key={i}
            ref={(el) => {
              panels.current[i] = el;
            }}
            className={`absolute inset-0 ${t.bg}`}
            style={{ clipPath: t.clip, transform: t.init }}
          />
        ))}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <g ref={lines} opacity={0} stroke="var(--color-ember)" strokeWidth={2.5} vectorEffect="non-scaling-stroke">
            <line x1="0" y1="0" x2="100" y2="100" vectorEffect="non-scaling-stroke" />
            <line x1="100" y1="0" x2="0" y2="100" vectorEffect="non-scaling-stroke" />
          </g>
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div
            ref={card}
            className="flex items-center gap-3 rounded-xl border border-dark-hairline bg-dark px-5 py-3.5 font-mono text-[15px] text-on-dark opacity-0 md:px-6 md:py-4 md:text-lg"
          >
            <span className="font-bold text-ember">{"{ }"}</span>
            <span>
              <span className="text-ember">$</span> {cmd}
              <span className="ml-0.5 animate-caret text-ember">▌</span>
            </span>
          </div>
        </div>
      </div>
    </JumpContext.Provider>
  );
}

/**
 * Site link. "/#section" on the home page: X-shutter jump. "/#section" elsewhere, or another page:
 * X wipe. Same-page links and modified clicks behave as usual.
 */
export function SectionLink({
  href,
  className,
  children,
  onNavigate,
  ...rest
}: { href: string; className?: string; children: ReactNode; onNavigate?: () => void } & Record<string, unknown>) {
  const pathname = usePathname();
  const { jump } = useSectionJump();
  const { navigate } = useXWipe();
  const hash = href.startsWith("/#") ? href.slice(1) : null;

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (hash) {
      e.preventDefault();
      onNavigate?.();
      if (pathname === "/") jump(hash);
      else navigate(href);
    } else if (href.startsWith("/") && href.split(/[?#]/)[0] !== pathname) {
      // Another page (/feedback, /join): the X wipe.
      e.preventDefault();
      onNavigate?.();
      navigate(href);
    }
  };

  return (
    <Link href={href} className={className} onClick={onClick} {...rest}>
      {children}
    </Link>
  );
}
