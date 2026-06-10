import { Suspense } from "react";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { Footer } from "@/components/layout/Footer";
import { Logo } from "@/components/layout/Logo";
import { BreadcrumbJsonLd } from "@/components/marketing/JsonLd";
import { APP_NAME } from "@/lib/brand";
import { buildPageMetadata } from "@/lib/seo-metadata";

export const dynamic = "force-static";

export const metadata = buildPageMetadata({
  title: "Create Account",
  description:
    `Create your ${APP_NAME} account to submit backlinks for indexing. 1 credit = 1 URL. Purchase credits via membership plans.`,
  path: "/register",
  keywords: ["backlink indexing signup", "url indexing register", "GetindexRocket register"],
});

export default function RegisterPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Sign up", path: "/register" },
        ]}
      />
      <section className="site-container py-16">
        <div className="mb-8 flex justify-center">
          <Logo variant="auth" />
        </div>
        <h1 className="mb-2 text-center text-2xl font-bold">Create your account</h1>
        <p className="mb-8 text-center text-sm text-[var(--muted)]">
          Sign up with Google or email, then purchase credits to submit URLs — 1 credit per URL
        </p>
        <Suspense>
          <AuthPanel mode="register" />
        </Suspense>
      </section>
      <Footer />
    </>
  );
}
