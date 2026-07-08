import { AnimateIn } from "@/components/ui/AnimateIn";
import { Icon } from "@/components/ui/Icon";
import { FOUNDER } from "@/lib/trust-content";

export function FounderSection() {
  const initials = FOUNDER.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <AnimateIn>
      <div className="ui-card ui-card-muted flex flex-col gap-8 md:flex-row md:items-start">
        <div
          className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent-15)] to-[var(--blue-15)] text-2xl font-bold text-[var(--text)]"
          aria-hidden
        >
          {initials}
        </div>
        <div className="max-w-2xl">
          <p className="eyebrow">Founder</p>
          <h2 className="section-title mt-1">{FOUNDER.name}</h2>
          <p className="mt-1 text-sm font-medium text-[var(--green)]">{FOUNDER.title}</p>
          <p className="text-lead mt-4">{FOUNDER.bio}</p>
          <ul className="mt-6 space-y-2.5">
            {FOUNDER.highlights.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-[var(--muted)]">
                <Icon name="check" size={16} className="mt-0.5 shrink-0 text-[var(--green)]" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AnimateIn>
  );
}
