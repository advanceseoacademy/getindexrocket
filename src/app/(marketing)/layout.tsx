import { Suspense } from "react";
import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";
import { NavWithSession } from "@/components/layout/NavWithSession";

export const dynamic = "force-dynamic";

function NavFallback() {
  return <Nav user={null} />;
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <Suspense fallback={<NavFallback />}>
        <NavWithSession />
      </Suspense>
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
