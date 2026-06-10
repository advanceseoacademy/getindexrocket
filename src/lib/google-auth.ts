import { OAuth2Client } from "google-auth-library";

function getGoogleClientId() {
  const clientId = process.env.GOOGLE_CLIENT_ID ?? process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID is not configured");
  }
  return clientId;
}

export type GoogleProfile = {
  email: string;
  name: string | null;
  googleId: string;
  emailVerified: boolean;
};

export async function verifyGoogleIdToken(idToken: string): Promise<GoogleProfile> {
  const client = new OAuth2Client(getGoogleClientId());
  const ticket = await client.verifyIdToken({
    idToken,
    audience: getGoogleClientId(),
  });

  const payload = ticket.getPayload();
  if (!payload?.email || !payload.sub) {
    throw new Error("Invalid Google token");
  }

  return {
    email: payload.email.toLowerCase().trim(),
    name: payload.name?.trim() || null,
    googleId: payload.sub,
    emailVerified: payload.email_verified ?? false,
  };
}
