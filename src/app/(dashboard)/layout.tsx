import { DashboardChrome } from "@/components/dashboard/DashboardChrome";
import { UserProvider } from "@/components/dashboard/UserProvider";
import { buildPrivatePageMetadata } from "@/lib/seo-metadata";

export const metadata = buildPrivatePageMetadata({
  title: "Dashboard",
  description: "Private dashboard area",
  path: "/dashboard",
});

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <DashboardChrome />
      {children}
    </UserProvider>
  );
}
