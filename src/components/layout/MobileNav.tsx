"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { MARKETING_NAV_LINKS } from "@/lib/nav-links";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelId = useId();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--card-border)] text-[var(--text)]"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
      >
        <span className="sr-only">{open ? "Close" : "Menu"}</span>
        {open ? (
          <span aria-hidden className="text-xl leading-none">
            ×
          </span>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[60] bg-black/50"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <nav
            id={panelId}
            className="fixed inset-y-0 right-0 z-[70] flex w-[min(100%,20rem)] flex-col border-l border-[var(--card-border)] bg-[var(--bg)] p-5 shadow-xl"
            aria-label="Mobile navigation"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted2)]">Menu</p>
            <ul className="mt-4 flex flex-col gap-1 overflow-y-auto">
              {MARKETING_NAV_LINKS.map((link) => {
                const active = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      prefetch
                      className={`block rounded-lg px-3 py-2.5 text-sm no-underline ${
                        active
                          ? "bg-[var(--accent-08)] font-medium text-[var(--text)]"
                          : "text-[var(--muted)] hover:bg-[var(--bg2)] hover:text-[var(--text)]"
                      }`}
                      aria-current={active ? "page" : undefined}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-auto flex flex-col gap-2 border-t border-[var(--card-border)] pt-4">
              <Link href="/login" className="btn btn-ghost btn-md no-underline">
                Sign in
              </Link>
              <Link href="/register" className="btn btn-primary btn-md no-underline">
                Get started
              </Link>
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
