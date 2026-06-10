"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0a0d12] text-[#eef0f3]">
        <h1 className="text-xl font-bold">Something went wrong</h1>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-[#22d37a] px-4 py-2 text-sm font-semibold text-[#050f08]"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
