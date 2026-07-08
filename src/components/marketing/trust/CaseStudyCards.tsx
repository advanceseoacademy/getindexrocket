import Link from "next/link";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { Icon } from "@/components/ui/Icon";
import { CASE_STUDIES } from "@/lib/trust-content";

export function CaseStudyCards({ compact = false }: { compact?: boolean }) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {CASE_STUDIES.map((study, i) => (
        <AnimateIn key={study.slug} delay={i * 60}>
          <article className="ui-card hover-lift flex h-full flex-col">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--green)]">
              {study.client}
            </p>
            <h3 className="mt-2 text-lg font-semibold leading-snug">{study.title}</h3>
            {!compact && (
              <>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{study.challenge}</p>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{study.solution}</p>
              </>
            )}
            <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--blue)]">
              <Icon name="chart" size={16} aria-hidden />
              {study.metric}
            </p>
            {!compact && (
              <ul className="mt-4 space-y-2 border-t border-[var(--card-border)] pt-4">
                {study.results.slice(0, 3).map((r) => (
                  <li key={r} className="flex items-start gap-2 text-xs text-[var(--muted)]">
                    <Icon name="check" size={14} className="mt-0.5 shrink-0 text-[var(--green)]" />
                    {r}
                  </li>
                ))}
              </ul>
            )}
            <Link href="/case-studies" className="text-link mt-auto pt-5 text-sm">
              Read full case study →
            </Link>
          </article>
        </AnimateIn>
      ))}
    </div>
  );
}
