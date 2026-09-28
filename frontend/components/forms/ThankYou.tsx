"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { Bracket } from "@/components/ui/Bracket";

type Line = { kind: "cmd" | "dim" | "ok"; text: string };
export type Script = { title: string; lines: Line[]; note: string };

const hash = () => Math.random().toString(16).slice(2, 9).padEnd(7, "0");
const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
const firstName = (name: string) => clip(name.trim().split(/\s+/)[0] ?? "", 14);

/** Join: the new member is a commit on main; the server answers 201 Created. */
export function joinScript(name: string): Script {
  const msg = `feat: add ${firstName(name).toLowerCase()} to CodeXLab`;
  return {
    title: "~/codexlab · join",
    lines: [
      { kind: "cmd", text: `git commit -m "${msg}"` },
      { kind: "dim", text: `[main ${hash()}] ${msg}` },
      { kind: "dim", text: " 1 club changed, 1 member(+)" },
      { kind: "cmd", text: "git push origin main" },
      { kind: "ok", text: "✔ 201 Created" },
    ],
    note: `Welcome aboard, ${firstName(name)}. We'll reach out on your email.`,
  };
}

/** Feedback: a review commit, stars as insertions; 202 Accepted = taken in, acted on later. */
export function feedbackScript(session: string, rating: number): Script {
  const msg = `review: ${clip(session, 24)}`;
  return {
    title: "~/codexlab · feedback",
    lines: [
      { kind: "cmd", text: `git commit -m "${msg}"` },
      { kind: "dim", text: `[main ${hash()}] ${msg}` },
      { kind: "dim", text: ` 1 file changed, ${rating} star${rating === 1 ? "" : "s"}(+)` },
      { kind: "cmd", text: "git push origin main" },
      { kind: "ok", text: "✔ 202 Accepted" },
    ],
    note: "Noted. Your feedback shapes the next session.",
  };
}

/**
 * Full-screen thank-you after a submit. An ember and a graphite panel sweep up over the page, a terminal
 * commits and pushes the submission, and when the push lands an empty fragment, </>, opens into <ThankYou/>.
 * The form swaps to its done state while covered (onSwap), then the panels lift (onDone).
 * Tap, click, Esc, Enter or Space skips to the exit. Transform/opacity only; reduced motion gets a plain fade.
 */
export function ThankYou({ script, onSwap, onDone }: { script: Script; onSwap: () => void; onDone: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const openRef = useRef<HTMLSpanElement>(null);
  const closeRef = useRef<HTMLSpanElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const skipTo = useRef<() => void>(() => {});
  const cbs = useRef({ onSwap, onDone });
  useEffect(() => {
    cbs.current = { onSwap, onDone };
  });

  useLayoutEffect(() => {
    const root = rootRef.current!;
    const q = gsap.utils.selector(root);
    const [ember, dark, content, note, prompt] = ["[data-ember]", "[data-dark]", "[data-content]", "[data-note]", "[data-prompt]"].map(
      (s) => q(s)[0] as HTMLElement,
    );
    const lineEls = q("[data-line]") as HTMLElement[];
    const typed = lineEls.map((el) => el.querySelector<HTMLElement>("[data-type]"));
    const carets = lineEls.map((el) => el.querySelector<HTMLElement>("[data-caret]"));
    const allCarets = carets.filter((c): c is HTMLElement => !!c);
    const chars = q("[data-ch]");
    const [open, close, word] = [openRef.current!, closeRef.current!, wordRef.current!];
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const tl = gsap.timeline({ onComplete: () => cbs.current.onDone() });
    typed.forEach((el, i) => el && (el.textContent = reduce ? script.lines[i].text : ""));

    if (reduce) {
      gsap.set([ember, dark], { yPercent: 0, autoAlpha: 0 });
      gsap.set(allCarets, { autoAlpha: 0 });
      tl.to([ember, dark], { autoAlpha: 1, duration: 0.3 })
        .addLabel("exit", 2.8)
        .call(() => cbs.current.onSwap(), [], "exit+=0.01")
        .to([ember, dark], { autoAlpha: 0, duration: 0.4 }, "exit+=0.1");
    } else {
      // The brackets start closed up on the word's centre, reading "</>".
      const w = word.getBoundingClientRect();
      const mid = w.left + w.width / 2;
      gsap.set([ember, dark], { yPercent: 100 });
      gsap.set([...lineEls, prompt, note], { autoAlpha: 0 });
      gsap.set(allCarets, { autoAlpha: 0 });
      gsap.set(note, { y: 14 });
      gsap.set(open, { x: mid - open.getBoundingClientRect().right, autoAlpha: 0, scale: 0.8 });
      gsap.set(close, { x: mid - close.getBoundingClientRect().left, autoAlpha: 0, scale: 0.8 });
      gsap.set(chars, { autoAlpha: 0, yPercent: 45 });

      tl.to(ember, { yPercent: 0, duration: 0.6, ease: "expo.out" }, 0)
        .to(dark, { yPercent: 0, duration: 0.75, ease: "expo.out" }, 0.08)
        .to([open, close], { autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(2)" }, 0.85);

      // Commands type out; their output prints at once, like a real terminal.
      let t = 0.55;
      script.lines.forEach((line, i) => {
        const el = lineEls[i];
        tl.set(el, { autoAlpha: 1 }, t);
        if (line.kind !== "cmd") {
          t += 0.1;
          return;
        }
        const out = typed[i]!;
        const n = { v: 0 };
        const dur = Math.min(0.5, line.text.length * 0.013);
        tl.set(carets[i], { autoAlpha: 1 }, t)
          .to(
            n,
            { v: line.text.length, duration: dur, ease: "none", onUpdate: () => void (out.textContent = line.text.slice(0, Math.round(n.v))) },
            t,
          )
          .set(carets[i], { autoAlpha: 0 }, t + dur + 0.1);
        t += dur + 0.12;
      });
      tl.set(prompt, { autoAlpha: 1 }, t);

      // The push lands: the fragment opens and the name fills in from the middle out.
      const at = t - 0.05;
      tl.to([open, close], { x: 0, duration: 1, ease: "power3.inOut" }, at)
        .to(chars, { autoAlpha: 1, yPercent: 0, duration: 0.8, ease: "expo.out", stagger: { each: 0.045, from: "center" } }, at + 0.25)
        .to(note, { autoAlpha: 1, y: 0, duration: 0.8, ease: "expo.out" }, at + 0.8)
        .addLabel("exit", at + 2.2)
        .call(() => cbs.current.onSwap(), [], "exit+=0.01")
        .to(content, { autoAlpha: 0, y: -24, duration: 0.35, ease: "power2.in" }, "exit")
        .to(dark, { yPercent: -100, duration: 0.8, ease: "expo.inOut" }, "exit+=0.2")
        .to(ember, { yPercent: -100, duration: 0.8, ease: "expo.inOut" }, "exit+=0.3");
    }

    skipTo.current = () => {
      if (tl.time() < tl.labels.exit) tl.seek("exit", false);
    };
    skipRef.current?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || !["Escape", "Enter", " "].includes(e.key)) return;
      e.preventDefault();
      skipTo.current();
    };
    const block = (e: Event) => e.preventDefault(); // the page underneath stays put while covered
    window.addEventListener("keydown", onKey);
    root.addEventListener("wheel", block, { passive: false });
    root.addEventListener("touchmove", block, { passive: false });
    return () => {
      tl.kill();
      window.removeEventListener("keydown", onKey);
      root.removeEventListener("wheel", block);
      root.removeEventListener("touchmove", block);
    };
  }, [script]);

  return createPortal(
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label="Thank you"
      onClick={() => skipTo.current()}
      className="fixed inset-0 z-[90] cursor-pointer overflow-hidden"
    >
      <div data-ember className="absolute inset-0 bg-ember" />
      <div data-dark className="absolute inset-0 bg-dark text-on-dark">
        <div data-content className="mx-auto flex h-full max-w-[1400px] flex-col px-5 pb-8 pt-4 md:px-10 md:pb-12 md:pt-7">
          <div className="flex items-center justify-between font-mono text-xs text-on-dark-soft">
            <span aria-hidden>{script.title}</span>
            <button ref={skipRef} type="button" className="-mr-3 inline-flex h-11 items-center gap-2 px-3 transition-colors hover:text-on-dark">
              skip <span className="hidden rounded border border-dark-hairline px-1.5 py-0.5 md:inline">esc</span>
            </button>
          </div>

          <div aria-hidden className="mt-4 whitespace-pre-wrap break-words font-mono text-xs leading-6 md:mt-8 md:text-sm md:leading-7">
            {script.lines.map((line, i) => (
              <div key={i} data-line className={line.kind === "ok" ? "text-terminal" : line.kind === "dim" ? "text-on-dark-soft" : ""}>
                {line.kind === "cmd" ? (
                  <>
                    <span className="text-ember">$ </span>
                    <span data-type />
                    <span data-caret className="text-ember">
                      ▌
                    </span>
                  </>
                ) : (
                  line.text
                )}
              </div>
            ))}
            <div data-prompt>
              <span className="text-ember">$ </span>
              <span className="animate-caret text-ember">▌</span>
            </div>
          </div>

          <div className="grid flex-1 place-items-center pb-[6vh] text-center">
            <div>
              <p
                aria-hidden
                className="whitespace-nowrap font-display text-[clamp(3rem,calc((100vw_-_2.5rem)/6.4),12rem)] font-bold leading-none tracking-[-0.04em]"
              >
                <span ref={openRef} className="mr-[0.05em] inline-block text-ember">
                  <Bracket side="open" />
                </span>
                <span ref={wordRef} className="inline-block">
                  {[..."ThankYou"].map((ch, i) => (
                    <span key={i} data-ch className="inline-block">
                      {ch}
                    </span>
                  ))}
                </span>
                <span ref={closeRef} className="ml-[0.07em] inline-block text-ember">
                  <Bracket side="close" />
                </span>
              </p>
              <p data-note className="mx-auto mt-5 max-w-[40ch] text-balance text-base text-on-dark-soft md:mt-7 md:text-lg">
                <span className="sr-only">Thank you. </span>
                {script.note}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
