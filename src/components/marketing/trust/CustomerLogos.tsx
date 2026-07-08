import { AnimateIn } from "@/components/ui/AnimateIn";
import { CUSTOMER_LOGOS } from "@/lib/trust-content";

export function CustomerLogos() {
  return (
    <div>
      <AnimateIn>
        <p className="eyebrow text-center">Customers</p>
        <p className="section-desc mx-auto text-center">Used by link building teams &amp; SEO agencies</p>
      </AnimateIn>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4 md:gap-5">
        {CUSTOMER_LOGOS.map((logo, i) => (
          <AnimateIn key={logo.name} delay={i * 45} variant="fade-in">
            <div
              className="flex h-14 min-w-[9rem] items-center gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--bg3)] px-4"
              title={logo.name}
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--accent-12)] to-[var(--blue-12)] text-xs font-bold text-[var(--text)]"
                aria-hidden
              >
                {logo.initials}
              </span>
              <span className="text-xs font-medium text-[var(--muted)] md:text-sm">{logo.name}</span>
            </div>
          </AnimateIn>
        ))}
      </div>
    </div>
  );
}
