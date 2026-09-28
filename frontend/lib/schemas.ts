import { z } from "zod";

export const intents = [
  { value: "look", label: "Have a look", hint: "Drop by a session as a guest" },
  { value: "join", label: "Join the club", hint: "Become a member of CodeXLab" },
  { value: "experience", label: "Experience a session", hint: "Try one hands-on session" },
] as const;

export const interestOptions = ["Web", "App", "DSA / CP", "AI / ML", "Open source", "UI / UX", "Cloud / DevOps"] as const;

export const years = ["1st year", "2nd year", "3rd year", "4th year", "Other"] as const;

export const joinSchema = z.object({
  intent: z.enum(["look", "join", "experience"], { error: "Pick what you're here for" }),
  name: z.string().trim().min(2, "Tell us your name"),
  email: z.email("That email doesn't look right"),
  branch: z.string().trim().min(2, "Your branch, e.g. CSE"),
  year: z.enum(years, { error: "Pick your year" }),
  enrollment: z.string().trim().min(4, "Your enrollment number, as on your ID card").max(30),
  rollNo: z.string().trim().max(30).optional().or(z.literal("")),
  interests: z.array(z.string()).max(interestOptions.length).default([]),
  message: z.string().trim().max(1000, "Keep it under 1000 characters").optional().or(z.literal("")),
});

export const feedbackSchema = z.object({
  sessionId: z.string().min(1, "Pick the session you attended"),
  sessionTitle: z.string().optional(),
  rating: z.coerce.number().int().min(1, "Give a rating").max(5),
  worked: z.string().trim().max(1000).optional().or(z.literal("")),
  // required on purpose: optional boxes get skipped. "nothing" is a valid answer.
  improve: z.string().trim().min(3, 'Write one thing, or just type "nothing"').max(1000),
  name: z.string().trim().max(80).optional().or(z.literal("")),
});

export type JoinInput = z.infer<typeof joinSchema>;
export type FeedbackInput = z.infer<typeof feedbackSchema>;

/** Flattens zod issues into { field: message } for inline errors. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}
