"use client";

import { useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { fieldErrors, intents, interestOptions, joinSchema, years } from "@/lib/schemas";
import { submitForm } from "@/lib/submit";
import { EASE_OUT } from "@/lib/motion";
import { CompileMark } from "@/components/logo/CompileMark";
import { BladeLoader } from "@/components/logo/BladeLoader";
import { describedBy, Field, Honeypot, inputClass, TerminalStatus } from "./Field";
import { joinScript, ThankYou, type Script } from "./ThankYou";

type Status = "idle" | "sending" | "done" | "error";

const ROLL_HINT = "In 3rd semester or above? Kindly add your full roll number too.";

export function JoinForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [intent, setIntent] = useState<string>("");
  const [interests, setInterests] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [simulated, setSimulated] = useState(false);
  const [thanks, setThanks] = useState<Script | null>(null);
  const doneRef = useRef<HTMLDivElement>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      intent,
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? "").trim(),
      branch: String(fd.get("branch") ?? ""),
      year: String(fd.get("year") ?? ""),
      enrollment: String(fd.get("enrollment") ?? ""),
      rollNo: String(fd.get("rollNo") ?? ""),
      interests,
      message: String(fd.get("message") ?? ""),
    };
    const parsed = joinSchema.safeParse(data);
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error);
      setErrors(errs);
      const first = Object.keys(errs)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"], #${first}`)?.focus();
      return;
    }
    setErrors({});
    setStatus("sending");
    const res = await submitForm("join", parsed.data, String(fd.get("website") ?? ""));
    if (res.ok) {
      setSimulated(Boolean(res.simulated));
      setThanks(joinScript(parsed.data.name)); // the form swaps to "done" once the thank-you covers the screen
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
        <motion.div
          ref={doneRef}
          tabIndex={-1}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="flex flex-col items-start gap-6 rounded-xl border border-hairline bg-surface-card p-8 outline-none md:p-12"
        >
          <CompileMark className="h-20 w-20 overflow-visible" />
          <div className="font-mono text-sm leading-relaxed text-body">
            <p>
              <span className="text-ember-text">$</span> ./experience --codexlab
            </p>
            <p className="text-terminal">✔ request received. see you at the next session</p>
            {simulated && <p className="mt-2 text-muted">(dev mode: not saved, set APPS_SCRIPT_URL to connect the Sheet)</p>}
          </div>
          <p className="max-w-[48ch] text-body">Someone from the CodeXLab core team will reach out on the email you gave us.</p>
        </motion.div>
        {overlay}
      </>
    );
  }

  return (
    <>
      <form ref={formRef} onSubmit={onSubmit} noValidate className="relative flex flex-col gap-10">
        <Honeypot />

        <fieldset>
          <legend className="mb-4 text-sm font-medium text-ink">What are you here for?</legend>
          <div
            id="intent"
            tabIndex={-1}
            className="grid gap-3 sm:grid-cols-3"
            role="radiogroup"
            aria-describedby={errors.intent ? "intent-error" : undefined}
          >
            {intents.map((opt) => {
              const active = intent === opt.value;
              return (
                <label
                  key={opt.value}
                  className={`group relative flex cursor-pointer flex-col gap-1 rounded-xl border p-4 sm:gap-2 sm:p-5 transition-[border-color,background-color,transform,scale] duration-200 active:scale-[0.99] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ember ${
                    active ? "border-ink bg-ink text-canvas" : "border-hairline bg-canvas hover:border-muted-soft"
                  }`}
                >
                  <input type="radio" name="intent" value={opt.value} checked={active} onChange={() => setIntent(opt.value)} className="sr-only" />
                  <span className={`font-mono text-xs ${active ? "text-ember" : "text-muted"}`}>--{opt.value}</span>
                  <span className="font-display text-xl font-semibold tracking-[-0.02em]">{opt.label}</span>
                  <span className={`text-sm ${active ? "text-on-dark-soft" : "text-muted"}`}>{opt.hint}</span>
                </label>
              );
            })}
          </div>
          {errors.intent && (
            <p id="intent-error" role="alert" className="mt-3 font-mono text-xs text-error">
              ! {errors.intent}
            </p>
          )}
        </fieldset>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field id="name" label="Name" error={errors.name}>
            <input
              id="name"
              name="name"
              autoComplete="name"
              className={inputClass}
              aria-invalid={!!errors.name}
              aria-describedby={describedBy("name", errors.name)}
            />
          </Field>
          <Field id="email" label="Email" error={errors.email}>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className={inputClass}
              aria-invalid={!!errors.email}
              aria-describedby={describedBy("email", errors.email)}
            />
          </Field>
          <Field id="branch" label="Branch" hint="e.g. CSE, IT, AI & ML" error={errors.branch}>
            <input
              id="branch"
              name="branch"
              className={inputClass}
              aria-invalid={!!errors.branch}
              aria-describedby={describedBy("branch", errors.branch, "e.g. CSE, IT, AI & ML")}
            />
          </Field>
          <Field id="year" label="Year" error={errors.year}>
            <select
              id="year"
              name="year"
              defaultValue=""
              className={inputClass}
              aria-invalid={!!errors.year}
              aria-describedby={describedBy("year", errors.year)}
            >
              <option value="" disabled>
                Select your year
              </option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </Field>
          <Field id="enrollment" label="Enrollment no." error={errors.enrollment}>
            <input
              id="enrollment"
              name="enrollment"
              autoComplete="off"
              className={inputClass}
              aria-invalid={!!errors.enrollment}
              aria-describedby={describedBy("enrollment", errors.enrollment)}
            />
          </Field>
          <Field id="rollNo" label="Roll no." optional hint={ROLL_HINT} error={errors.rollNo}>
            <input
              id="rollNo"
              name="rollNo"
              autoComplete="off"
              className={inputClass}
              aria-invalid={!!errors.rollNo}
              aria-describedby={describedBy("rollNo", errors.rollNo, ROLL_HINT)}
            />
          </Field>
        </div>

        <fieldset>
          <legend className="mb-3 text-sm font-medium text-ink">
            What are you into?<span className="ml-1.5 font-normal text-muted">(optional, pick any)</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {interestOptions.map((opt) => {
              const on = interests.includes(opt);
              return (
                <label
                  key={opt}
                  className={`inline-flex h-10 cursor-pointer items-center rounded-full border px-4 font-mono text-xs transition-colors duration-150 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ember ${
                    on ? "border-ember bg-ember text-canvas" : "border-hairline text-body hover:border-muted-soft"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={on}
                    onChange={() => setInterests((cur) => (on ? cur.filter((i) => i !== opt) : [...cur, opt]))}
                  />
                  {on ? "✓ " : "+ "}
                  {opt}
                </label>
              );
            })}
          </div>
        </fieldset>

        <Field id="message" label="Anything you want us to know?" optional error={errors.message}>
          <textarea
            id="message"
            name="message"
            rows={4}
            className={`${inputClass} resize-y`}
            aria-invalid={!!errors.message}
            aria-describedby={describedBy("message", errors.message)}
          />
        </Field>

        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={status === "sending"}
            className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-lg bg-ember px-6 font-medium text-canvas sm:w-auto sm:justify-start transition-[background-color,transform,scale] duration-150 hover:bg-ember-active active:scale-[0.98] disabled:cursor-progress disabled:opacity-80"
          >
            {status === "sending" ? (
              <>
                <BladeLoader className="h-4 w-4" tone="mono" /> Sending…
              </>
            ) : (
              <>
                Send it <span className="font-mono">→</span>
              </>
            )}
          </button>
          <AnimatePresence>
            {status === "error" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <TerminalStatus tone="err">✖ {message}</TerminalStatus>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>
      {overlay}
    </>
  );
}
