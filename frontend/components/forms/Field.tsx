import type { ComponentPropsWithoutRef, ReactNode } from "react";

export const inputClass =
  // text-base (16px) on phones: iOS zooms the whole page into any field set smaller than 16px when it's tapped
  "w-full rounded-lg border border-hairline bg-canvas px-3.5 py-2.5 text-base [&:not(textarea)]:h-12 sm:[&:not(textarea)]:h-11 text-ink placeholder:text-muted-soft sm:text-[15px] transition-[border-color,box-shadow] duration-150 focus:border-ember focus:outline-none focus:ring-[3px] focus:ring-ember/15 aria-[invalid=true]:border-error";

export function Field({
  id,
  label,
  optional,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {optional && <span className="ml-1.5 font-normal text-muted">(optional)</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="font-mono text-xs text-error">
          ! {error}
        </p>
      )}
    </div>
  );
}

export function describedBy(id: string, error?: string, hint?: string) {
  return error ? `${id}-error` : hint ? `${id}-hint` : undefined;
}

/** Hidden honeypot. Real people never fill it. */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Leave this empty
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

export function TerminalStatus({ tone, children }: { tone: "ok" | "err"; children: ReactNode }) {
  return (
    <p role="status" className={`font-mono text-sm ${tone === "ok" ? "text-terminal" : "text-error"}`}>
      {children}
    </p>
  );
}

export type InputProps = ComponentPropsWithoutRef<"input">;
