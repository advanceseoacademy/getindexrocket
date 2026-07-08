import Link from "next/link";

type NavGuestActionsProps = {
  compact?: boolean;
};

export function NavGuestActions({ compact = false }: NavGuestActionsProps) {
  return (
    <div
      className={`nav-actions flex shrink-0 items-center justify-end gap-2 sm:gap-3 ${
        compact ? "" : "min-h-11 min-w-[9rem] sm:min-w-[14rem]"
      }`}
    >
      {!compact && (
        <Link href="/login" className="text-link text-sm">
          Sign in
        </Link>
      )}
      <Link href="/register" className={`btn btn-primary ${compact ? "btn-sm" : "btn-md"}`}>
        {compact ? "Start" : "Get started"}
      </Link>
    </div>
  );
}
