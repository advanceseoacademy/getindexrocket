import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";
import { getSessionUser } from "@/lib/auth";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionUser = await getSessionUser();

  return (
    <div className="flex min-h-full flex-col">
      <Nav
        user={
          sessionUser
            ? { email: sessionUser.email, creditBalance: sessionUser.creditBalance }
            : null
        }
      />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
