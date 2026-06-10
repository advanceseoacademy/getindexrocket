import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";
import { APP_NAME } from "@/lib/brand";
import { buildPrivatePageMetadata } from "@/lib/seo-metadata";

export const metadata = buildPrivatePageMetadata({
  title: "Page not found",
  description: "The page you requested could not be found.",
  path: "/404",
});

export default function NotFound() {
  return (
    <>
      <Nav />
      <main id="main-content" className="site-container flex flex-1 flex-col items-center justify-center py-24 text-center">
        <p className="text-sm font-medium text-[var(--green)]">404</p>
        <h1 className="mt-2 text-3xl font-bold">Page not found</h1>
        <p className="mt-3 max-w-md text-[var(--muted)]">
          That URL does not exist on {APP_NAME}. Head back home or sign in to your dashboard.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-[10px] bg-[var(--green)] px-6 py-3 text-sm font-semibold text-[#050f08] no-underline"
          >
            Go home
          </Link>
          <Link
            href="/login"
            className="rounded-[10px] border border-[var(--card-border)] px-6 py-3 text-sm text-[var(--muted)] no-underline hover:text-[var(--text)]"
          >
            Sign in
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
