import { Nav } from "@/components/layout/Nav";
import { getSessionUser } from "@/lib/auth";

export async function NavWithSession() {
  const sessionUser = await getSessionUser();

  return (
    <Nav
      user={
        sessionUser
          ? { email: sessionUser.email, creditBalance: sessionUser.creditBalance }
          : null
      }
    />
  );
}
