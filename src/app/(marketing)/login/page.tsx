import { Suspense } from "react";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { Footer } from "@/components/layout/Footer";
import { Logo } from "@/components/layout/Logo";
import { BreadcrumbJsonLd } from "@/components/marketing/JsonLd";
import { APP_NAME } from "@/lib/brand";
import { buildPageMetadata } from "@/lib/seo-metadata";

export const dynamic = "force-static";

export const metadata = buildPageMetadata({
  title: "Sign In",
  description: `Sign in to your ${APP_NAME} account to submit backlinks and track indexing status.`,
  path: "/login",
  index: false,
});

export default function LoginPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Sign in", path: "/login" },
        ]}
      />
      <section className="site-container py-16">
        <div className="mb-8 flex justify-center">
          <Logo variant="auth" />
        </div>
        <h1 className="mb-2 text-center text-2xl font-bold">Sign in</h1>
        <p className="mb-8 text-center text-sm text-[var(--muted)]">
          Sign in with Google or your email to access your dashboard
        </p>
        <Suspense>
          <AuthPanel mode="login" />
        </Suspense>
      </section>
      <Footer />
    </>
  );
}
