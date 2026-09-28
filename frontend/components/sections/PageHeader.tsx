import { TagHeading } from "@/components/ui/TagHeading";

export function PageHeader({ name, eyebrow, lead }: { name: string; eyebrow: string; lead: string }) {
  return (
    <header className="mb-14">
      <TagHeading name={name} eyebrow={eyebrow} level={1} />
      <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-body">{lead}</p>
    </header>
  );
}
