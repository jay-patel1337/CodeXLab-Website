export type SubmitResult =
  | { ok: true; simulated?: boolean }
  | { ok: false; error?: string; errors?: Record<string, string> };

export async function submitForm(type: "join" | "feedback", data: unknown, website: string): Promise<SubmitResult> {
  try {
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, data, website }),
    });
    return (await res.json()) as SubmitResult;
  } catch {
    return { ok: false, error: "Network error. Check your connection and try again." };
  }
}
