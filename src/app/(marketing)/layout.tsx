import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";
import { SiteSchemasJsonLd } from "@/components/marketing/JsonLd";
import { SupportChatbot } from "@/components/marketing/SupportChatbot";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <SiteSchemasJsonLd />
      <Nav user={null} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
      <SupportChatbot />
    </div>
  );
}
