import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { Logo } from "@/components/layout/Logo";
import { BreadcrumbJsonLd } from "@/components/marketing/JsonLd";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { APP_NAME } from "@/lib/brand";
import { buildPageMetadata } from "@/lib/seo-metadata";

export const dynamic = "force-dynamic";

export const metadata = buildPageMetadata({
  title: "Sign In",
  description: `Sign in to your ${APP_NAME} account to submit backlinks and track indexing status.`,
  path: "/login",
  index: false,
});

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user && isAdmin(user)) redirect("/admin");

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Sign in", path: "/login" },
        ]}
      />
      <section className="site-container py-16">
        <div className="mb-8 flex animate-hero-in justify-center">
          <Logo variant="auth" />
        </div>
        <h1 className="animate-hero-in-delay-1 mb-2 text-center text-2xl font-bold">Sign in</h1>
        <p className="animate-hero-in-delay-2 mb-8 text-center text-sm text-[var(--muted)]">
          Sign in with Google or your email to access your dashboard
        </p>
        <Suspense>
          <AuthPanel mode="login" />
        </Suspense>
      </section>
    </>
  );
}
