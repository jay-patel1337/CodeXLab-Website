import type { Metadata } from "next";
import { JoinForm } from "@/components/forms/JoinForm";
import { PageHeader } from "@/components/sections/PageHeader";

export const metadata: Metadata = {
  title: "Join",
  description: "Have a look, join the club, or experience a CodeXLab session yourself.",
};

export default function JoinPage() {
  return (
    <div className="page-enter mx-auto max-w-[920px] px-5 pb-28 pt-32 md:px-10 md:pt-40">
      <PageHeader
        name="Join"
        eyebrow="$ ./experience --codexlab"
        lead="Come see a session, try one hands-on, or join the club. Tell us a little about you and we'll get back to you."
      />
      <JoinForm />
    </div>
  );
}
