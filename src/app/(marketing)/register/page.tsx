import Link from "next/link";

import { redirect } from "next/navigation";

import { Suspense } from "react";

import { AuthPanel } from "@/components/auth/AuthPanel";

import { Logo } from "@/components/layout/Logo";

import { BreadcrumbJsonLd } from "@/components/marketing/JsonLd";

import { VisibleBreadcrumbs } from "@/components/marketing/VisibleBreadcrumbs";

import { getSessionUser, isAdmin } from "@/lib/auth";

import { APP_NAME } from "@/lib/brand";

import { buildPageMetadata } from "@/lib/seo-metadata";



export const dynamic = "force-dynamic";



export const metadata = buildPageMetadata({

  title: "Create Account",

  description:

    `Create your ${APP_NAME} account to submit backlinks for indexing. 1 credit = 1 URL. Purchase credits via membership plans.`,

  path: "/register",

  index: false,

  keywords: ["backlink indexing signup", "url indexing register", "GetIndexRocket register"],

});



export default async function RegisterPage() {

  const user = await getSessionUser();

  if (user) {

    redirect(isAdmin(user) ? "/admin" : "/dashboard");

  }



  return (

    <>

      <BreadcrumbJsonLd

        items={[

          { name: "Home", path: "/" },

          { name: "Sign up", path: "/register" },

        ]}

      />

      <section className="site-container py-16">

        <VisibleBreadcrumbs

          items={[

            { name: "Home", path: "/" },

            { name: "Sign up", path: "/register" },

          ]}

        />

        <div className="mb-8 flex animate-hero-in justify-center">

          <Logo variant="auth" />

        </div>

        <h1 className="animate-hero-in-delay-1 mb-2 text-center text-2xl font-bold">Create your account</h1>

        <p className="animate-hero-in-delay-2 mb-8 text-center text-sm text-[var(--muted)]">

          Sign up with Google or email, then purchase credits to submit URLs — 1 credit per URL

        </p>

        <Suspense>

          <AuthPanel mode="register" />

        </Suspense>

        <p className="mt-6 text-center text-sm text-[var(--muted)]">

          <Link href="/" className="text-link">

            ← Back to home

          </Link>

        </p>

      </section>

    </>

  );

}

