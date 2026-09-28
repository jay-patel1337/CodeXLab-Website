import type { Metadata } from "next";
import { getSessions } from "@/lib/sessions";
import { FeedbackForm } from "@/components/forms/FeedbackForm";
import { PageHeader } from "@/components/sections/PageHeader";

export const metadata: Metadata = {
  title: "Feedback",
  description: "Attended a CodeXLab session? Tell us what worked and what to improve.",
};

export default async function FeedbackPage({ searchParams }: { searchParams: Promise<{ session?: string }> }) {
  const [{ session }, { sessions }] = await Promise.all([searchParams, getSessions()]);
  return (
    <div className="page-enter mx-auto max-w-[760px] px-5 pb-28 pt-32 md:px-10 md:pt-40">
      <PageHeader name="Feedback" eyebrow="// after the session" lead="Two minutes of honest feedback makes the next session better for everyone." />
      <FeedbackForm sessions={sessions.map(({ id, title, date }) => ({ id, title, date }))} preselect={session} />
    </div>
  );
}
