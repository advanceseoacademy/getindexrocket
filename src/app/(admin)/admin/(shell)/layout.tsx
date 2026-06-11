import { redirect } from "next/navigation";
import { Nav } from "@/components/layout/Nav";
import { AdminNav } from "@/components/admin/AdminNav";
import { getSessionUser } from "@/lib/auth";

export default async function AdminShellLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  if (user.role !== "admin") redirect("/dashboard");

  return (
    <>
      <Nav
        user={{ email: user.email, creditBalance: user.creditBalance }}
      />
      <main id="main-content" className="site-container flex-1 py-10 animate-page-in">
        <AdminNav />
        {children}
      </main>
    </>
  );
}
