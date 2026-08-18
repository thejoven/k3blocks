import SectionLabel from "@/components/SectionLabel";

/**
 * Route placeholder: Layout-wrapped centered page title.
 * Replaced by the real page implementations owned by other agents.
 */
export default function Placeholder({ title, label }: { title: string; label?: string }) {
  return (
    <div className="mx-auto flex max-w-shell flex-col items-center px-6 py-32 text-center">
      {label && <SectionLabel>{label}</SectionLabel>}
      <h1 className="mt-4 text-[32px] font-semibold leading-tight tracking-[-0.015em] text-text-1">
        {title}
      </h1>
      <p className="mt-3 font-mono text-[13px] text-text-4">This page is under construction.</p>
    </div>
  );
}
