"use client";

/* eslint-disable @next/next/no-img-element -- remote images from the Sheet */
import { SectionLink } from "@/components/ui/SectionJump";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, cancelFrame, frame, motion } from "motion/react";
import type { Session } from "@/lib/sessions";
import { EASE_INOUT, EASE_OUT, EASE_SOFT } from "@/lib/motion";
import { Reveal } from "@/components/ui/Reveal";
import { ScrambleText } from "@/components/ui/ScrambleText";
import { PhotoGallery } from "@/components/sessions/PhotoGallery";

function formatDate(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/**
 * Holds an element exactly where it is on screen for a while: the clicked row's header stays put
 * while rows open and close around it (a row closing above it would otherwise drag it up).
 * The check runs after motion has written the frame's styles and before paint, so a correction is
 * never visible. The browser's own scroll anchoring is paused meanwhile so the two never fight,
 * and any real scroll input (wheel, touch, keys) lets go at once.
 */
function useHold() {
  const release = useRef<(() => void) | null>(null);
  useEffect(() => () => release.current?.(), []);
  return useCallback((el: HTMLElement, ms: number) => {
    release.current?.();
    const root = document.documentElement;
    const y0 = el.getBoundingClientRect().top;
    const until = performance.now() + ms;
    const hold = () => {
      if (!el.isConnected || performance.now() > until) return release.current?.();
      const dy = el.getBoundingClientRect().top - y0;
      if (Math.abs(dy) > 0.5) window.scrollBy({ top: dy, behavior: "instant" });
    };
    const input = ["wheel", "touchmove", "keydown", "pointerdown"] as const; // pointerdown: scrollbar drags, next click
    const letGo = () => release.current?.();
    root.style.overflowAnchor = "none";
    frame.postRender(hold, true);
    input.forEach((t) => window.addEventListener(t, letGo, { passive: true }));
    release.current = () => {
      cancelFrame(hold);
      input.forEach((t) => window.removeEventListener(t, letGo));
      root.style.overflowAnchor = "";
      release.current = null;
    };
  }, []);
}

export function SessionsLog({ sessions, sample = false }: { sessions: Session[]; sample?: boolean }) {
  const [tag, setTag] = useState<string>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const hold = useHold();

  const tags = useMemo(() => Array.from(new Set(sessions.flatMap((s) => s.tags))).sort(), [sessions]);
  const visible = tag === "all" ? sessions : sessions.filter((s) => s.tags.includes(tag));

  if (!sessions.length) {
    return (
      <p className="mt-16 font-mono text-lg text-on-dark-soft">
        <span className="text-ember">$</span> git log → no sessions yet. first commit coming soon
        <span className="animate-caret text-ember">_</span>
      </p>
    );
  }

  return (
    <div className="mt-16 md:mt-20">
      {tags.length > 1 && (
        <div role="group" aria-label="Filter sessions by topic" className="mb-10 flex flex-wrap gap-2.5 md:mb-14">
          {["all", ...tags].map((t) => {
            const active = tag === t;
            return (
              <button
                key={t}
                type="button"
                aria-pressed={active}
                onClick={() => setTag(t)}
                className={`h-10 rounded-full border px-5 font-mono text-[13px] transition-colors duration-150 ${
                  active ? "border-ember bg-ember text-canvas" : "border-dark-hairline bg-dark/60 text-on-dark-soft hover:border-on-dark-soft hover:text-on-dark"
                }`}
              >
                {t === "all" ? "--all" : t}
              </button>
            );
          })}
        </div>
      )}

      <LayoutGroup>
        <ol className="relative">
          <span aria-hidden className="absolute bottom-10 left-[9px] top-10 w-px bg-gradient-to-b from-ember/60 via-dark-hairline to-dark-hairline md:left-[11px]" />
          <AnimatePresence initial={false} mode="popLayout">
            {visible.map((s, i) => {
              const open = openId === s.id;
              const head = i === 0 && tag === "all";
              return (
                <motion.li
                  key={s.id}
                  // position only: a size layout animation scales the row (and its text) while it expands
                  layout="position"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: EASE_OUT }}
                  // Own compositing layer: while a row above opens, this one only changes position,
                  // which the GPU does for free instead of re-drawing the row every frame (big on phones).
                  className="relative pl-10 will-change-transform md:pl-14"
                >
                  {/* relative: the dot is positioned from the Reveal box at all times. While a row faded in,
                      its transform made the Reveal the dot's container and the dot sat 40px right, on the hash. */}
                  <Reveal index={i} className="relative">
                    <span
                      aria-hidden
                      className={`absolute -left-10 top-[34px] h-[19px] w-[19px] rounded-full border-2 md:-left-14 md:top-[42px] md:h-[23px] md:w-[23px] ${
                        head ? "border-ember bg-ember shadow-[0_0_0_6px_color-mix(in_oklab,var(--color-ember)_18%,transparent)]" : "border-on-dark-soft bg-dark"
                      }`}
                    />
                    <div
                      className={`-ml-4 -mr-2 rounded-2xl border-b border-dark-hairline pl-4 pr-2 transition-colors duration-200 md:-mx-6 md:px-6 ${
                        open ? "bg-dark-soft/85" : "hover:bg-dark-soft/40 has-[>button:active]:bg-dark-soft/50" // :active = tap feedback on phones
                      }`}
                    >
                      <button
                        type="button"
                        aria-expanded={open}
                        aria-controls={`s-${s.id}`}
                        onClick={(e) => {
                          hold(e.currentTarget, 1000); // covers this row opening and another one closing
                          setOpenId(open ? null : s.id);
                        }}
                        className="group relative grid w-full grid-cols-1 gap-3 py-7 text-left md:grid-cols-[10rem_1fr_auto] md:items-center md:gap-10 md:py-9"
                      >
                        <span className="font-mono text-[13px] leading-relaxed text-on-dark-soft">
                          <span className="text-ember">{s.hash}</span>
                          {head && <span className="ml-2 rounded bg-ember/15 px-1.5 py-0.5 text-ember">HEAD</span>}
                          <span className="ml-3 md:ml-0 md:mt-1 md:block">
                            <ScrambleText text={formatDate(s.date)} />
                          </span>
                        </span>
                        <span>
                          <span className="block pr-12 font-display text-[clamp(1.5rem,3vw,2.45rem)] font-semibold leading-[1.08] tracking-[-0.025em] text-on-dark transition-colors duration-150 group-hover:text-ember md:pr-0">
                            {s.title}
                          </span>
                          <span className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[15px] text-on-dark-soft">
                            {s.speaker && <span>by {s.speaker}</span>}
                            {s.tags.map((t) => (
                              <span key={t} className="rounded-full border border-dark-hairline px-3 py-0.5 font-mono text-xs">
                                {t}
                              </span>
                            ))}
                            {s.attendees !== null && <span className="font-mono text-xs md:hidden">{s.attendees} attended</span>}
                          </span>
                        </span>
                        {/* phones: just the toggle, top-right beside the hash line (it used to take a row of its own) */}
                        <span className="absolute right-0 top-6 flex items-center gap-5 font-mono text-xs text-on-dark-soft md:static md:justify-end">
                          {s.attendees !== null && <span className="hidden md:inline">{s.attendees} attended</span>}
                          {s.photos[0] ? (
                            <img
                              src={s.photos[0]}
                              alt=""
                              loading="lazy"
                              referrerPolicy="no-referrer"
                              className="hidden h-16 w-24 rounded-lg object-cover opacity-80 transition-opacity group-hover:opacity-100 md:block"
                            />
                          ) : null}
                          <span
                            aria-hidden
                            className={`grid h-10 w-10 place-items-center rounded-full border text-lg transition-[transform,scale,rotate,border-color,color] duration-300 ${
                              open ? "rotate-45 border-ember text-ember" : "border-dark-hairline group-hover:border-on-dark-soft"
                            }`}
                          >
                            +
                          </span>
                        </span>
                      </button>

                      <AnimatePresence initial={false}>
                        {open && (
                          // Height: ease-in-out, and a short delay so the (heavy) mount frame is over before it
                          // moves; with an ease-out the first late frame showed up as a ~200px jump.
                          // The content only fades (on its own layer), in place: nothing slides inside the
                          // opening box. data-session-body lets the Sessions background ignore open rows.
                          <motion.div
                            id={`s-${s.id}`}
                            key="body"
                            data-session-body
                            initial={{ height: 0 }}
                            animate={{ height: "auto", transition: { duration: 0.8, ease: EASE_INOUT, delay: 0.06 } }}
                            exit={{ height: 0, transition: { duration: 0.6, ease: EASE_INOUT, delay: 0.08 } }}
                            className="overflow-hidden"
                          >
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1, transition: { duration: 0.7, ease: EASE_SOFT, delay: 0.2 } }}
                              exit={{ opacity: 0, transition: { duration: 0.22, ease: EASE_OUT } }}
                              style={{ willChange: "opacity" }}
                              className="grid gap-10 pb-10 md:grid-cols-[10rem_1fr] md:gap-10 md:pb-12"
                            >
                              <span className="hidden md:block" />
                              <div className="grid gap-10">
                                <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-12">
                                  <div>
                                    {s.summary && <p className="max-w-[58ch] text-lg leading-relaxed text-on-dark md:text-xl">{s.summary}</p>}
                                    <div className="mt-7 flex flex-wrap gap-3">
                                      {s.resourcesUrl && (
                                        <a
                                          href={s.resourcesUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="inline-flex h-11 items-center rounded-lg bg-ember px-5 text-sm font-medium text-canvas transition-colors hover:bg-ember-active"
                                        >
                                          Resources ↗
                                        </a>
                                      )}
                                      <SectionLink
                                        href={`/feedback?session=${encodeURIComponent(s.id)}`}
                                        className="inline-flex h-11 items-center rounded-lg border border-dark-hairline px-5 text-sm font-medium text-on-dark transition-colors hover:border-ember hover:text-ember"
                                      >
                                        Attended? Give feedback →
                                      </SectionLink>
                                    </div>
                                  </div>
                                  <dl className="grid content-start gap-3 font-mono text-[13px]">
                                    {[
                                      ["commit", s.hash],
                                      ["date", formatDate(s.date)],
                                      ["speaker", s.speaker || "CodeXLab"],
                                      ["topics", s.tags.join(", ") || "general"],
                                      ...(s.attendees !== null ? [["attended", String(s.attendees)]] : []),
                                    ].map(([k, v]) => (
                                      <div key={k} className="flex gap-4 border-b border-dark-hairline pb-3">
                                        <dt className="w-20 shrink-0 text-on-dark-soft">{k}</dt>
                                        <dd className="text-on-dark">{v}</dd>
                                      </div>
                                    ))}
                                  </dl>
                                </div>
                                <PhotoGallery photos={s.photos} title={s.title} sample={sample} />
                              </div>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </Reveal>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ol>
      </LayoutGroup>
    </div>
  );
}
