import Link from "next/link";

export function NavGuestActions() {
  return (
    <div className="flex items-center gap-3">
      <Link
        href="/login"
        className="text-base text-[var(--muted)] no-underline hover:text-[var(--text)]"
      >
        Login
      </Link>
      <Link
        href="/register"
        className="rounded-[10px] bg-[var(--green)] px-4 py-2 text-base font-semibold text-[var(--on-accent)] no-underline"
      >
        Get Started
      </Link>
    </div>
  );
}
