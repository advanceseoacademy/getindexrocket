import { AnimateIn } from "@/components/ui/AnimateIn";
import { Icon } from "@/components/ui/Icon";
import { TESTIMONIALS } from "@/lib/trust-content";

type TestimonialsGridProps = {
  showEyebrow?: boolean;
  limit?: number;
};

export function TestimonialsGrid({ showEyebrow = true, limit }: TestimonialsGridProps) {
  const items = limit ? TESTIMONIALS.slice(0, limit) : TESTIMONIALS;

  return (
    <div>
      {showEyebrow && (
        <AnimateIn>
          <p className="eyebrow">Testimonials</p>
          <h2 className="section-title">Trusted by SEO professionals</h2>
          <p className="section-desc">
            Link builders and agencies use our platform for honest pipeline reporting and fair credit
            policies.
          </p>
        </AnimateIn>
      )}
      <div className={`grid gap-6 md:grid-cols-3 ${showEyebrow ? "mt-12" : ""}`}>
        {items.map((t, i) => (
          <AnimateIn key={t.name} delay={i * 80}>
            <blockquote className="ui-card hover-lift flex h-full flex-col">
              <Icon name="quote" size={22} className="text-[var(--accent-25)]" aria-hidden />
              <p className="mt-4 text-sm leading-relaxed text-[var(--text)]">&ldquo;{t.quote}&rdquo;</p>
              <footer className="mt-auto border-t border-[var(--card-border)] pt-5">
                <p className="font-semibold">{t.name}</p>
                <p className="text-xs text-[var(--muted)]">{t.role}</p>
                <p className="mt-0.5 text-xs text-[var(--green)]">{t.company}</p>
              </footer>
            </blockquote>
          </AnimateIn>
        ))}
      </div>
    </div>
  );
}
