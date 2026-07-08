import { AnimateIn } from "@/components/ui/AnimateIn";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  desc?: string;
  id?: string;
  align?: "left" | "center";
};

export function SectionHeader({ eyebrow, title, desc, id, align = "left" }: SectionHeaderProps) {
  const alignClass = align === "center" ? "text-center mx-auto" : "";

  return (
    <AnimateIn>
      {eyebrow && <p className={`eyebrow ${alignClass}`}>{eyebrow}</p>}
      <h2 id={id} className={`section-title ${alignClass}`}>
        {title}
      </h2>
      {desc && <p className={`section-desc ${alignClass}`}>{desc}</p>}
    </AnimateIn>
  );
}
