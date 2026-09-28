"use client";

import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Bracket } from "./Bracket";

const base =
  "group relative inline-flex h-11 items-center justify-center gap-1 rounded-lg px-5 font-medium text-[15px] transition-[transform,scale,background-color,color] duration-150 active:scale-[0.98] focus-visible:outline-offset-4";
const variants = {
  ember: "bg-ember text-canvas hover:bg-ember-active",
  ink: "bg-ink text-canvas hover:bg-dark",
  ghost: "border border-hairline bg-canvas text-ink hover:bg-surface-card",
  dark: "bg-dark-elevated text-on-dark hover:bg-dark-soft",
} as const;

function Label({ children }: { children: ReactNode }) {
  const b =
    "inline-flex opacity-0 transition-all duration-200 ease-[var(--ease-out-expo)] group-hover:opacity-100 group-focus-visible:opacity-100";
  return (
    <>
      <span aria-hidden className={`${b} -translate-x-1 group-hover:translate-x-0 group-focus-visible:translate-x-0`}>
        <Bracket side="open" weight={12} />
      </span>
      <span>{children}</span>
      <span aria-hidden className={`${b} translate-x-1 group-hover:translate-x-0 group-focus-visible:translate-x-0`}>
        <Bracket side="close" weight={12} />
      </span>
    </>
  );
}

/** Button whose label gets wrapped as <Label/> on hover. */
export function BracketButton({
  variant = "ember",
  className = "",
  children,
  ...rest
}: { variant?: keyof typeof variants } & ComponentPropsWithoutRef<"button">) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      <Label>{children}</Label>
    </button>
  );
}

export function BracketLink({
  variant = "ember",
  className = "",
  children,
  ...rest
}: { variant?: keyof typeof variants } & ComponentPropsWithoutRef<typeof Link>) {
  return (
    <Link className={`${base} ${variants[variant]} ${className}`} {...rest}>
      <Label>{children}</Label>
    </Link>
  );
}
