import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { Logo } from "@/components/layout/Logo";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { buildPrivatePageMetadata } from "@/lib/seo-metadata";

export const metadata = buildPrivatePageMetadata({
  title: "Admin Sign In",
  description: "Admin login",
  path: "/admin/login",
});

export default async function AdminLoginPage() {
  const user = await getSessionUser();
  if (user && isAdmin(user)) redirect("/admin");

  return (
    <section className="site-container flex min-h-[70vh] animate-page-in flex-col items-center justify-center py-16">
      <div className="mb-8">
        <Logo variant="auth" linked={false} />
      </div>
      <h1 className="mb-2 text-center text-2xl font-bold">Admin sign in</h1>
      <p className="mb-8 text-center text-sm text-[var(--muted)]">
        Email and password only — admin accounts are not registered publicly
      </p>
      <Suspense>
        <AdminLoginForm />
      </Suspense>
    </section>
  );
}
