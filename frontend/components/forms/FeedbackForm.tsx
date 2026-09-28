"use client";

import { useRef, useState, type FormEvent } from "react";
import { feedbackSchema, fieldErrors } from "@/lib/schemas";
import { submitForm } from "@/lib/submit";
import { BladeLoader } from "@/components/logo/BladeLoader";
import { describedBy, Field, Honeypot, inputClass, TerminalStatus } from "./Field";
import { feedbackScript, ThankYou, type Script } from "./ThankYou";

type Option = { id: string; title: string; date: string };
type Status = "idle" | "sending" | "done" | "error";

const IMPROVE_HINT = 'Nothing to improve? Just type "nothing".';

/** Basic feedback form (MVP placeholder; the full feedback system is planned separately). */
export function FeedbackForm({ sessions, preselect }: { sessions: Option[]; preselect?: string }) {
  const [rating, setRating] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [simulated, setSimulated] = useState(false);
  const [thanks, setThanks] = useState<Script | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const sessionId = String(fd.get("sessionId") ?? "");
    const data = {
      sessionId,
      sessionTitle: sessions.find((s) => s.id === sessionId)?.title ?? "",
      rating,
      worked: String(fd.get("worked") ?? ""),
      improve: String(fd.get("improve") ?? ""),
      name: String(fd.get("name") ?? ""),
    };
    const parsed = feedbackSchema.safeParse(data);
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error);
      setErrors(errs);
      formRef.current?.querySelector<HTMLElement>(`[name="${Object.keys(errs)[0]}"]`)?.focus();
      return;
    }
    setErrors({});
    setStatus("sending");
    const res = await submitForm("feedback", parsed.data, String(fd.get("website") ?? ""));
    if (res.ok) {
      setSimulated(Boolean(res.simulated));
      setThanks(feedbackScript(parsed.data.sessionTitle || "session", parsed.data.rating)); // swaps to "done" once covered
    } else {
      if (res.errors) setErrors(res.errors);
      setMessage(res.error ?? "Please fix the highlighted fields.");
      setStatus("error");
    }
  };

  const overlay = thanks && (
    <ThankYou
      script={thanks}
      onSwap={() => {
        setStatus("done");
        window.scrollTo({ top: 0, behavior: "instant" });
      }}
      onDone={() => {
        setThanks(null);
        doneRef.current?.focus({ preventScroll: true });
      }}
    />
  );

  if (status === "done") {
    return (
      <>
        <div
          ref={doneRef}
          tabIndex={-1}
          className="rounded-xl border border-hairline bg-surface-card p-8 font-mono text-sm leading-relaxed text-body outline-none"
        >
          <p className="text-terminal">✔ feedback logged. thank you, it shapes the next session</p>
          {simulated && <p className="mt-2 text-muted">(dev mode: not saved, set APPS_SCRIPT_URL to connect the Sheet)</p>}
        </div>
        {overlay}
      </>
    );
  }

  const known = sessions.some((s) => s.id === preselect);

  return (
    <>
      <form ref={formRef} onSubmit={onSubmit} noValidate className="relative flex flex-col gap-8">
        <Honeypot />
        <Field id="sessionId" label="Which session did you attend?" error={errors.sessionId}>
          <select
            id="sessionId"
            name="sessionId"
            defaultValue={known ? preselect : ""}
            className={inputClass}
            aria-invalid={!!errors.sessionId}
            aria-describedby={describedBy("sessionId", errors.sessionId)}
          >
            <option value="" disabled>
              Select a session
            </option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.date} · {s.title}
              </option>
            ))}
          </select>
        </Field>

        <fieldset>
          <legend className="mb-3 text-sm font-medium text-ink">How was it overall?</legend>
          <div role="radiogroup" aria-label="Rating from 1 to 5" className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <label
                key={n}
                className={`grid h-12 w-12 cursor-pointer place-items-center rounded-lg border font-mono text-lg transition-colors duration-150 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ember ${
                  n <= rating ? "border-ember bg-ember text-canvas" : "border-hairline text-body hover:border-muted-soft"
                }`}
              >
                <input type="radio" name="rating" value={n} checked={rating === n} onChange={() => setRating(n)} className="sr-only" />
                {n}
              </label>
            ))}
          </div>
          {errors.rating && (
            <p role="alert" className="mt-2 font-mono text-xs text-error">
              ! {errors.rating}
            </p>
          )}
        </fieldset>

        <Field id="worked" label="What worked?" optional>
          <textarea id="worked" name="worked" rows={3} className={`${inputClass} resize-y`} />
        </Field>
        <Field id="improve" label="What should we improve?" hint={IMPROVE_HINT} error={errors.improve}>
          <textarea
            id="improve"
            name="improve"
            rows={3}
            className={`${inputClass} resize-y`}
            aria-invalid={!!errors.improve}
            aria-describedby={describedBy("improve", errors.improve, IMPROVE_HINT)}
          />
        </Field>
        <Field id="name" label="Your name" optional hint="Leave empty to stay anonymous">
          <input id="name" name="name" autoComplete="name" className={inputClass} aria-describedby="name-hint" />
        </Field>

        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={status === "sending"}
            className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-lg bg-ink px-6 font-medium text-canvas sm:w-auto sm:justify-start transition-[background-color,transform,scale] duration-150 hover:bg-dark active:scale-[0.98] disabled:cursor-progress disabled:opacity-80"
          >
            {status === "sending" ? (
              <>
                <BladeLoader className="h-4 w-4" tone="mono" /> Sending…
              </>
            ) : (
              "Submit feedback"
            )}
          </button>
          {status === "error" && <TerminalStatus tone="err">✖ {message}</TerminalStatus>}
        </div>
      </form>
      {overlay}
    </>
  );
}
