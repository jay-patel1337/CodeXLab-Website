import { NextResponse } from "next/server";
import { feedbackSchema, fieldErrors, joinSchema } from "@/lib/schemas";

/**
 * Validates Join / Feedback submissions and forwards them to the Google Apps Script
 * web app (apps-script/Code.gs), which appends a row to the matching Sheet tab.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // Honeypot: pretend success so bots don't retry.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const type = body.type;
  const parsed =
    type === "join" ? joinSchema.safeParse(body.data) : type === "feedback" ? feedbackSchema.safeParse(body.data) : null;
  if (!parsed) return NextResponse.json({ ok: false, error: "Unknown form" }, { status: 400 });
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: fieldErrors(parsed.error) }, { status: 422 });
  }

  const endpoint = process.env.APPS_SCRIPT_URL;
  if (!endpoint) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[submit] APPS_SCRIPT_URL not set — dev only, not saved:`, type, parsed.data);
      return NextResponse.json({ ok: true, simulated: true });
    }
    return NextResponse.json({ ok: false, error: "Form is not connected yet. Please try again later." }, { status: 503 });
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ type, secret: process.env.APPS_SCRIPT_SECRET ?? "", data: parsed.data }),
      redirect: "follow",
      cache: "no-store",
    });
    const out = (await res.json().catch(() => null)) as { ok?: boolean } | null;
    if (!res.ok || !out?.ok) throw new Error(`Apps Script responded ${res.status}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[submit] forward failed:", err);
    return NextResponse.json({ ok: false, error: "Couldn't save that right now. Please try again." }, { status: 502 });
  }
}
