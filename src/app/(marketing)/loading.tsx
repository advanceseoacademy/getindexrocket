export default function MarketingLoading() {
  return (
    <div className="site-container py-16" aria-hidden="true">
      <div className="h-9 w-56 max-w-full animate-pulse rounded-lg bg-[var(--bg2)]" />
      <div className="mt-4 h-4 w-32 animate-pulse rounded bg-[var(--bg2)]" />
      <div className="mt-8 space-y-3">
        <div className="h-4 w-full max-w-3xl animate-pulse rounded bg-[var(--bg2)]" />
        <div className="h-4 w-full max-w-2xl animate-pulse rounded bg-[var(--bg2)]" />
        <div className="h-4 w-full max-w-xl animate-pulse rounded bg-[var(--bg2)]" />
      </div>
    </div>
  );
}
