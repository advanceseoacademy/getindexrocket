import Link from "next/link";

type Crumb = { name: string; path: string };

export function VisibleBreadcrumbs({ items }: { items: Crumb[] }) {
  if (items.length < 2) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-sm text-[var(--muted)]">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-1.5">
              {i > 0 && (
                <span className="text-[var(--muted2)]" aria-hidden>
                  /
                </span>
              )}
              {last ? (
                <span className="font-medium text-[var(--text)]" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link href={item.path} className="text-link no-underline hover:underline">
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
