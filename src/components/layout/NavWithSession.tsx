import { Nav } from "@/components/layout/Nav";
import { getSessionUser, isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function NavWithSession() {
  const sessionUser = await getSessionUser();

  return (
    <Nav
      user={
        sessionUser
          ? { email: sessionUser.email, creditBalance: sessionUser.creditBalance }
          : null
      }
      isAdmin={isAdmin(sessionUser)}
    />
  );
}
