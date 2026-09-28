"use client";

/* eslint-disable @next/next/no-img-element -- pixel-exact assets must bypass the image optimizer */
import { useEffect, useState } from "react";
import px from "./brand-px.json";
import { usePixelSnap } from "@/components/ui/usePixelSnap";

type Exact = { w: number; h: number; set: { d: number; src: string }[]; full: string };

/** The screen's devicePixelRatio, kept current across browser zoom and monitor changes (null on the server). */
function useDpr() {
  const [dpr, setDpr] = useState<number | null>(null);
  useEffect(() => {
    let mq: MediaQueryList | undefined;
    const update = () => {
      mq?.removeEventListener("change", update);
      setDpr(window.devicePixelRatio || 1);
      mq = matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      mq.addEventListener("change", update);
    };
    update();
    return () => mq?.removeEventListener("change", update);
  }, []);
  return dpr;
}

/**
 * An <img> whose file is pre-rendered at the exact device-pixel size for each screen density
 * (see scripts/build-brand.mjs), shown in a fixed integer CSS box: the browser never resamples it.
 * Densities without a file (browser zoom 90% / 110%, 225% scaling…) get the full-resolution
 * original in a box that is a whole number of device pixels, so it is one clean downscale
 * instead of a 1.25x file squeezed by a fraction.
 */
function ExactImg({ asset, dpr, className = "" }: { asset: Exact; dpr: number | null; className?: string }) {
  const onGrid = dpr === null || asset.set.some((s) => Math.abs(s.d - dpr) < 0.01);
  const w = onGrid ? asset.w : Math.round(asset.w * dpr) / dpr;
  const h = onGrid ? asset.h : Math.round(asset.h * dpr) / dpr;
  return (
    <img
      src={onGrid ? asset.set[0].src : asset.full}
      srcSet={onGrid ? asset.set.map((s) => `${s.src} ${s.d}x`).join(", ") : undefined}
      width={asset.w}
      height={asset.h}
      alt=""
      decoding="async"
      fetchPriority="high"
      draggable={false}
      className={`block max-w-none select-none ${className}`}
      style={{ width: w, height: h }}
    />
  );
}

/**
 * Official Silver Oak University artwork (never recolored or re-arranged).
 * - sm and up: the supplied lockup as-is: seal, name, divider and NAAC A (48px; 56px from md).
 * - phones: seal + NAAC A.
 * The NAAC rating is always visible.
 */
export function SouLockup({ settleRoot }: { settleRoot?: () => HTMLElement | null }) {
  const snapRef = usePixelSnap<HTMLSpanElement>(settleRoot);
  const dpr = useDpr();
  return (
    <span ref={snapRef} className="flex items-center" role="img" aria-label="Silver Oak University, NAAC accredited with grade A">
      <span className="flex items-center gap-1.5 sm:hidden">
        <ExactImg asset={px["sou-seal-36"]} dpr={dpr} />
        <ExactImg asset={px["naac-a-36"]} dpr={dpr} />
      </span>
      <ExactImg asset={px["sou-lockup-48"]} dpr={dpr} className="hidden sm:block md:hidden" />
      <ExactImg asset={px["sou-lockup-56"]} dpr={dpr} className="hidden md:block" />
    </span>
  );
}

/** Footer band version: responsive width with a width-descriptor set. */
export function SouLockupWide({ className = "" }: { className?: string }) {
  const set = px["sou-lockup-footer"].set;
  return (
    <img
      src={set[1].src}
      srcSet={set.map((s) => `${s.src} ${s.w}w`).join(", ")}
      sizes="(min-width: 768px) 420px, calc(100vw - 88px)"
      width={px["sou-lockup-footer"].w}
      height={px["sou-lockup-footer"].h}
      alt="Silver Oak University, NAAC accredited with grade A"
      loading="lazy"
      decoding="async"
      className={`h-auto w-full max-w-[420px] ${className}`}
    />
  );
}
