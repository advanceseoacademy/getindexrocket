export function AdminStatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="hover-lift rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
      <p className="text-xs text-[var(--muted)]">{label}</p>
      <p
        className="mt-2 text-2xl font-bold"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </p>
      {sub ? <p className="mt-1 text-xs text-[var(--muted)]">{sub}</p> : null}
    </div>
  );
}

export function AdminPanel({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="hover-lift rounded-2xl border border-[var(--card-border)] bg-[var(--card)]">
      <div className="flex items-center justify-between gap-4 border-b border-[var(--card-border)] px-5 py-4">
        <h2 className="text-sm font-semibold">{title}</h2>
        {action}
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function AdminTable({ children }: { children: React.ReactNode }) {
  return (
    <table className="w-full min-w-[640px] text-left text-sm">
      {children}
    </table>
  );
}

export function AdminBadge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "green" | "orange" | "red" | "blue";
}) {
  const tones = {
    default: "bg-[var(--bg3)] text-[var(--muted)]",
    green: "bg-[var(--blue-15)] text-[var(--success)]",
    orange: "bg-[var(--accent-15)] text-[var(--accent)]",
    red: "bg-[rgba(239,68,68,0.15)] text-[#f87171]",
    blue: "bg-[var(--blue-15)] text-[var(--blue)]",
  };
  return (
    <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatUsd(n: number) {
  return `$${n.toFixed(2)}`;
}

export function AdminLoading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-[var(--bg3)]" />
        ))}
      </div>
      <div className="h-64 rounded-2xl bg-[var(--bg3)]" />
    </div>
  );
}

export function AdminPagination({
  page,
  pages,
  onPage,
}: {
  page: number;
  pages: number;
  onPage: (p: number) => void;
}) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <p className="text-xs text-[var(--muted)]">
        Page {page} of {pages}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className="rounded-lg border border-[var(--card-border)] px-3 py-1.5 text-xs disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
          className="rounded-lg border border-[var(--card-border)] px-3 py-1.5 text-xs disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export function AdminSearchBar({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder ?? "Search…"}
      className="w-full max-w-xs rounded-lg border border-[var(--card-border)] bg-[var(--bg2)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
    />
  );
}
