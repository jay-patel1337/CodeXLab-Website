"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";

/** em: extra room per slot in the array view / the next-pointer gap between list nodes. */
export const G_ARRAY = 0.08;
export const G_LIST = 0.24;
const REST = 6; // s of plain wordmark between runs
const RESUME = 2.5; // s after returning to the top before a new run

/**
 * The hero word as a data structure, on a loop (all transform/opacity):
 *   array   the letters spread a touch; cells + indices appear         const club = [..."CodeXLab"];
 *   stack   top = the end: pop() lifts b, a, L out (last in, first out)  stack.pop();
 *   queue   enqueue() slides L, a, b back in at the rear, in order       queue.enqueue('L');
 *   list    indices go, cells separate into nodes, next-pointers draw    LinkedList.from(club)
 *   rest    back to the plain wordmark
 * Runs only at the top of the page with the hero in view and the tab visible; never with reduced
 * motion. Any scroll sends it straight back to rest, so the scroll split always starts from the plain word.
 * Each run is a fresh timeline, measured at rest, so resizes and fonts never leave stale numbers.
 */
export function useWordLoop(
  wrapRef: RefObject<HTMLDivElement | null>,
  pushRef: RefObject<HTMLDivElement | null>,
  enabled: boolean,
  firstDelay: number,
) {
  useEffect(() => {
    const wrap = wrapRef.current;
    const push = pushRef.current;
    if (!enabled || !wrap || !push || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const h1 = wrap.querySelector("h1");
    const op = wrap.querySelector<HTMLElement>("[data-cap-op]");
    const res = wrap.querySelector<HTMLElement>("[data-cap-res]");
    const cap = wrap.querySelector<HTMLElement>("[data-cap]");
    if (!h1 || !op || !res || !cap) return;

    const q = gsap.utils.selector(wrap);
    const one = (sel: string) => wrap.querySelector(sel) as HTMLElement;
    const glyph = (i: number) => one(`[data-glyph][data-i="${i}"]`);
    const mark = (kind: string, i: number) => one(`[data-mark="${kind}"][data-i="${i}"]`);
    const parts = () => ({
      slots: q("[data-slot]") as HTMLElement[],
      glyphs: q("[data-glyph]") as HTMLElement[],
      cells: q("[data-cell]") as HTMLElement[],
      nodes: q("[data-node]") as HTMLElement[],
      idx: q("[data-idx]") as HTMLElement[],
      arrows: q("[data-arrow]") as HTMLElement[],
      marks: q("[data-mark]") as HTMLElement[],
      tail: q("[data-null]") as HTMLElement[],
    });

    let tl: gsap.core.Timeline | null = null;
    let wait: gsap.core.Tween | null = null;

    const run = () => {
      wait = null;
      const { slots, cells, nodes, idx, arrows, tail } = parts();
      if (slots.length !== 8) return;

      // ---- measure at rest (no loop transforms applied) ----
      const F = parseFloat(getComputedStyle(h1!).fontSize);
      const hr = h1!.getBoundingClientRect();
      const xr = one("[data-x]").getBoundingClientRect();
      const bl = slots[0].getBoundingClientRect().bottom - xr.bottom; // baseline inset of a letter box
      h1!.style.setProperty("--bl", `${bl}px`);
      const box = slots.map((s) => {
        const r = s.getBoundingClientRect();
        return { l: r.left - hr.left, r: r.right - hr.left };
      });
      const gA = G_ARRAY * F;
      const gL = G_LIST * F;
      const xA = box.map((_, i) => (i - 3.5) * gA);
      const xL = box.map((_, i) => (i - 3.5) * gL);
      const cx = hr.width / 2;
      const cy = hr.height / 2;
      const vw = document.documentElement.clientWidth;
      const avail = vw - 2 * (vw < 640 ? 14 : 28);
      // array view: cells reach half a gap past the outer letters
      const aL = box[0].l + xA[0] - gA / 2;
      const aR = box[7].r + xA[7] + gA / 2;
      const sA = Math.min(1, avail / (aR - aL));
      const tA = sA * (cx - (aL + aR) / 2);
      // list view: nodes + the "→ null" tail
      const lL = box[0].l + xL[0] - 0.03 * F;
      const lR = box[7].r + xL[7] + 0.03 * F + (tail[0]?.offsetWidth ?? 0);
      const sL = Math.min(0.86, avail / (lR - lL));
      const tL = sL * (cx - (lL + lR) / 2);
      // indices hang under the cells: nudge the tagline down just enough while they show
      const baseY = hr.height - bl;
      const idxBottom = baseY + 0.16 * F + 14;
      const tagTop = push!.getBoundingClientRect().top - hr.top;
      const pushY = Math.max(0, cy + sA * (idxBottom - cy) + 16 - tagTop);
      // the caption sits clear above the pointer labels (top / front / rear / head) in the array view
      const labelsTop = baseY - 0.88 * F - 30;
      cap!.style.bottom = `calc(100% + ${Math.max(0, -(cy + sA * (labelsTop - cy))) + 14}px)`;
      cap!.style.left = `${cx + tA + sA * (aL - cx)}px`; // flush with the array's left wall
      // letters enqueued at the rear start just beyond the last cell
      const rear = box[7].r + xA[7] + gA / 2 + 0.25 * F;
      const enter = (i: number) => rear - (box[i].l + xA[i]);

      // ---- caption: typed in / erased like a terminal ----
      const t = gsap.timeline({ defaults: { ease: "sine.inOut", duration: 0.6 } });
      tl = t;
      const type = (el: HTMLElement, text: string, at: number) => {
        const o = { n: 0 };
        t.to(o, {
          n: text.length,
          duration: text.length / 34,
          ease: "none",
          onUpdate: () => void (el.textContent = text.slice(0, Math.round(o.n))),
        }, at);
      };
      const erase = (el: HTMLElement, from: string, at: number) => {
        const o = { n: from.length };
        t.to(o, {
          n: 0,
          duration: Math.max(0.15, from.length / 70),
          ease: "none",
          onUpdate: () => void (el.textContent = from.slice(0, Math.round(o.n))),
        }, at);
      };
      const fadeIn = (el: HTMLElement | HTMLElement[], at: number, d = 0.5) =>
        t.fromTo(el, { opacity: 0, y: -6 }, { opacity: 1, y: 0, duration: d, immediateRender: false }, at);
      const fadeOut = (el: HTMLElement | HTMLElement[], at: number, d = 0.4) => t.to(el, { opacity: 0, y: -6, duration: d }, at);

      const L1 = 'const club = [..."CodeXLab"];';
      const L2 = "stack.pop();";
      const L3 = "queue.enqueue(";
      const L4 = "const list = LinkedList.from(club);";

      // ---- 1. array ----
      t.call(() => {
        h1!.classList.add("cx-loop");
        op.textContent = "";
        res.textContent = "";
      }, [], 0.01);
      t.to(cap, { opacity: 1, duration: 0.4 }, 0.05);
      type(op, L1, 0.2);
      t.to(slots, { x: (i) => xA[i], duration: 1.6, ease: "power2.inOut" }, 0.3);
      t.to(h1, { x: tA, scale: sA, duration: 1.6, ease: "power2.inOut" }, 0.3);
      t.to(push, { y: pushY, duration: 1.6, ease: "power2.inOut" }, 0.3);
      t.to(cells, { opacity: 1, duration: 1.0, stagger: 0.07 }, 1.3);
      t.fromTo(idx, { opacity: 0, y: -4 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.06, immediateRender: false }, 1.6);
      type(res, "  // array", 1.3);

      // ---- 2. stack: pop "Lab" off the top, last in first out ----
      const S = 3.2;
      erase(res, "  // array", S);
      erase(op, L1, S + 0.2);
      type(op, L2, S + 0.75);
      fadeIn(mark("top", 7), S + 0.9);
      const popped = ["b", "a", "L"];
      let prev = "";
      popped.forEach((ch, k) => {
        const i = 7 - k;
        const at = S + 1.6 + k * 1.15;
        t.to(glyph(i), { y: -0.55 * F, opacity: 0, duration: 1.0, ease: "power2.in" }, at);
        fadeOut(mark("top", i), at);
        if (prev) erase(res, prev, at + 0.15);
        const r = `  // '${ch}'`;
        type(res, r, at + 0.35);
        prev = r;
        fadeIn(mark("top", i - 1), at + 0.75);
      });

      // ---- 3. queue: enqueue L, a, b at the rear, first in first out ----
      const Q = S + 1.6 + 3 * 1.15 + 0.6; // ≈ 8.85
      fadeOut(mark("top", 4), Q);
      erase(res, prev, Q);
      erase(op, L2, Q + 0.15);
      type(op, L3, Q + 0.55);
      fadeIn(mark("front", 0), Q + 0.8);
      fadeIn(mark("rear", 4), Q + 0.9);
      prev = "";
      ["L", "a", "b"].forEach((ch, k) => {
        const i = 5 + k;
        const at = Q + 1.6 + k * 1.35;
        if (prev) erase(res, prev, at - 0.45);
        const r = `'${ch}');`;
        type(res, r, at - 0.25);
        prev = r;
        t.set(glyph(i), { x: enter(i), y: 0, opacity: 0 }, at);
        t.to(glyph(i), { x: 0, duration: 1.35, ease: "power3.out" }, at);
        t.to(glyph(i), { opacity: 1, duration: 0.55, ease: "none" }, at);
        fadeOut(mark("rear", i - 1), at + 0.6);
        fadeIn(mark("rear", i), at + 0.85);
      });

      // ---- 4. linked list: same data, now nodes + next pointers ----
      const Lk = Q + 1.6 + 3 * 1.35 + 0.7; // ≈ 15.2
      fadeOut([mark("front", 0), mark("rear", 7)], Lk);
      erase(res, prev, Lk);
      erase(op, L3, Lk + 0.15);
      type(op, L4, Lk + 0.6);
      t.to(idx, { opacity: 0, y: 4, duration: 0.6, stagger: 0.03 }, Lk + 0.2);
      t.to(cells, { opacity: 0, duration: 1.1 }, Lk + 0.7);
      t.to(nodes, { opacity: 1, duration: 1.1 }, Lk + 0.7);
      t.to(slots, { x: (i) => xL[i], duration: 2.0, ease: "power2.inOut" }, Lk + 0.6);
      t.to(h1, { x: tL, scale: sL, duration: 2.0, ease: "power2.inOut" }, Lk + 0.6);
      t.to(push, { y: 0, duration: 2.0, ease: "power2.inOut" }, Lk + 0.6);
      fadeIn(mark("head", 0), Lk + 2.3);
      t.fromTo(arrows, { opacity: 0, scaleX: 0 }, { opacity: 1, scaleX: 1, duration: 0.55, ease: "power2.out", stagger: 0.17, transformOrigin: "0% 50%", immediateRender: false }, Lk + 2.5);
      t.to(tail, { opacity: 1, duration: 0.6 }, Lk + 2.5 + 7 * 0.17);
      type(res, "  // nodes + next", Lk + 2.4);

      // ---- 5. back to the word ----
      const B = Lk + 6.4;
      erase(res, "  // nodes + next", B);
      erase(op, L4, B + 0.2);
      t.to(arrows, { opacity: 0, scaleX: 0, duration: 0.4, stagger: { each: 0.07, from: "end" } }, B);
      t.to([...tail, mark("head", 0)], { opacity: 0, duration: 0.4 }, B);
      t.to(nodes, { opacity: 0, duration: 0.9 }, B + 0.6);
      t.to(slots, { x: 0, duration: 1.8, ease: "power2.inOut" }, B + 0.5);
      t.to(h1, { x: 0, scale: 1, duration: 1.8, ease: "power2.inOut" }, B + 0.5);
      t.to(cap, { opacity: 0, duration: 0.5 }, B + 1.2);
      t.call(() => h1!.classList.remove("cx-loop"), [], B + 2.3);
      t.eventCallback("onComplete", () => {
        tl = null;
        schedule(REST);
      });
    }

    /** Snap-free return to the plain word from wherever a run was interrupted. */
    const settle = () => {
      const { slots, glyphs, cells, nodes, idx, arrows, marks, tail } = parts();
      gsap.to([...cells, ...nodes, ...idx, ...marks, ...tail, cap], { opacity: 0, duration: 0.35 });
      gsap.to(arrows, { opacity: 0, scaleX: 0, duration: 0.35 });
      gsap.to(glyphs, { x: 0, y: 0, opacity: 1, duration: 0.5, ease: "power2.out" });
      gsap.to(slots, { x: 0, duration: 0.5, ease: "power2.out" });
      gsap.to(h1, { x: 0, scale: 1, duration: 0.5, ease: "power2.out" });
      gsap.to(push, { y: 0, duration: 0.5, ease: "power2.out" });
      op!.textContent = "";
      res!.textContent = "";
      h1!.classList.remove("cx-loop");
    }

    const allowed = () => window.scrollY <= 8 && !document.hidden && inView;
    function schedule(delay: number) {
      wait?.kill();
      wait = allowed() ? gsap.delayedCall(delay, () => (allowed() ? run() : (wait = null))) : null;
    }
    function stop() {
      wait?.kill();
      wait = null;
      if (!tl) return;
      tl.kill();
      tl = null;
      settle();
    }
    function check() {
      if (!allowed()) stop();
      else if (!tl && !wait) schedule(RESUME);
    }

    let inView = true;
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      check();
    }, { threshold: 0.5 });
    io.observe(wrap);
    const onResize = () => {
      stop();
      schedule(RESUME);
    };
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", check);
    schedule(firstDelay);

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", check);
      wait?.kill();
      tl?.kill();
      h1.classList.remove("cx-loop");
    };
  }, [wrapRef, pushRef, enabled, firstDelay]);
}
