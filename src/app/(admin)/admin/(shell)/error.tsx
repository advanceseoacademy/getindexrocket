"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-2xl border border-[rgba(248,113,113,0.35)] bg-[rgba(248,113,113,0.08)] p-8 text-center">
      <h2 className="text-lg font-semibold">Admin panel error</h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        {error.message || "Something went wrong loading the admin dashboard."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--on-accent)]"
      >
        Try again
      </button>
    </div>
  );
}
