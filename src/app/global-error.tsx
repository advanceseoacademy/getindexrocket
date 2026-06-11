"use client";

import "./globals.css";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--bg)] text-[var(--text)]">
        <h1 className="text-xl font-bold">Something went wrong</h1>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--on-accent)]"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
