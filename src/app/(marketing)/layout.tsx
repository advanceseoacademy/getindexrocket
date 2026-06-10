import { Nav } from "@/components/layout/Nav";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      <main id="main-content" className="flex-1">
        {children}
      </main>
    </>
  );
}
