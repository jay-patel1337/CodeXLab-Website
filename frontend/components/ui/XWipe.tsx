"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { animate } from "motion/react";
import { EASE_OUT } from "@/lib/motion";

type Ctx = { navigate: (href: string) => void };
const WipeContext = createContext<Ctx>({ navigate: () => {} });
export const useXWipe = () => useContext(WipeContext);

/**
 * Page transition: a graphite band and an ember band sweep across on the two
 * diagonals (forming an X), the route changes underneath, then they sweep out.
 */
export function XWipeProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const inkRef = useRef<HTMLDivElement>(null);
  const emberRef = useRef<HTMLDivElement>(null);
  const pending = useRef<{ from: string; timer?: ReturnType<typeof setTimeout> } | null>(null);

  const reveal = useCallback(async () => {
    const ink = inkRef.current;
    const ember = emberRef.current;
    if (!ink || !ember) return;
    await Promise.all([
      animate(ember, { y: ["0%", "-420%"] }, { duration: 0.85, ease: EASE_OUT }),
      animate(ink, { y: ["0%", "-115%"] }, { duration: 1, ease: EASE_OUT, delay: 0.1 }),
    ]);
    pending.current = null;
    setActive(false);
  }, []);

  const navigate = useCallback(
    async (href: string) => {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        router.push(href);
        return;
      }
      if (pending.current) return;
      pending.current = { from: window.location.pathname };
      setActive(true);
      await new Promise(requestAnimationFrame);
      const ink = inkRef.current!;
      const ember = emberRef.current!;
      await Promise.all([
        animate(ink, { y: ["115%", "0%"] }, { duration: 0.75, ease: EASE_OUT }),
        animate(ember, { y: ["420%", "0%"] }, { duration: 0.7, ease: EASE_OUT, delay: 0.12 }),
      ]);
      router.push(href);
      const target = new URL(href, window.location.href).pathname;
      // Same-path navigation never changes pathname, so reveal on a timer.
      if (target === pending.current?.from) setTimeout(reveal, 250);
      else if (pending.current) pending.current.timer = setTimeout(reveal, 2500);
    },
    [router, reveal],
  );

  useEffect(() => {
    if (!pending.current || pathname === pending.current.from) return;
    clearTimeout(pending.current.timer);
    if (window.location.hash) {
      // Arriving at a section (/#sessions): the home page lands itself once its scroll scene exists.
      setTimeout(reveal, 180);
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
      reveal();
    }
  }, [pathname, reveal]);

  return (
    <WipeContext.Provider value={{ navigate }}>
      {children}
      <div aria-hidden className={`pointer-events-none fixed inset-0 z-[80] overflow-hidden ${active ? "" : "hidden"}`}>
        <div className="absolute left-1/2 top-1/2 h-[170vmax] w-[320vmax] -translate-x-1/2 -translate-y-1/2 rotate-45">
          <div ref={inkRef} className="h-full w-full bg-ink" style={{ transform: "translateY(115%)" }} />
        </div>
        <div className="absolute left-1/2 top-1/2 h-[26vmax] w-[320vmax] -translate-x-1/2 -translate-y-1/2 -rotate-45">
          <div ref={emberRef} className="h-full w-full bg-ember" style={{ transform: "translateY(420%)" }} />
        </div>
      </div>
    </WipeContext.Provider>
  );
}
