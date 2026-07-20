export const APP_NAME = "GetIndexRocket";
export const APP_SLUG = "getindexrocket";
export const APP_DOMAIN = "getindexrocket.com";
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? `https://${APP_DOMAIN}`;
export const APP_TAGLINE = "Boost your rankings";
export const LOGO_PATH = "/logo.png";
export const LOGO_ALT = "GetindexRocket — Boost Your Rankings";

export const BMC_WEBHOOK_URL = `${APP_URL}/api/webhooks/buymeacoffee`;
export const BMC_MEMBERSHIP_URL =
  process.env.NEXT_PUBLIC_BMC_MEMBERSHIP_URL ??
  "https://buymeacoffee.com/litonislam/membership";

/** User-facing cost: 1 credit = 1 URL submitted */
export const CREDIT_PER_URL = 1;

/** Free credits granted on new account signup (email or Google). */
export const SIGNUP_BONUS_CREDITS = 5;

export type IndexingTier = "standard" | "instant";
