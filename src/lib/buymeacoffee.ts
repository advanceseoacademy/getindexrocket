import { createHmac, timingSafeEqual } from "crypto";

export type BmcWebhookPayload = {
  supporter_email?: string;
  supporter_name?: string;
  number_of_coffees?: string;
  total_amount?: string;
  amount?: string;
  support_created_on?: string;
  created_at?: string;
  transaction_id?: string;
  payment_id?: string;
  psp_id?: string;
  membership_level_id?: string;
  membership_level_name?: string;
  status?: string;
  duration_type?: string;
  currency?: string;
  current_period_start?: string;
  current_period_end?: string;
  canceled?: string | boolean;
  canceled_at?: string;
  cancel_at_period_end?: string | boolean;
  paused?: string | boolean;
  note?: string;
  message?: string;
  support_note?: string;
};

export const BMC_EVENTS = {
  coffeePurchase: "coffee.purchase",
  coffeeLinkPurchase: "coffee_link.purchase",
  membershipStarted: "membership.started",
  membershipUpdated: "membership.updated",
  membershipCancelled: "membership.cancelled",
} as const;

export function verifyBmcSignature(rawBody: string, signature: string | null) {
  const secret = process.env.BMC_WEBHOOK_SECRET;
  if (!secret || !signature) return !secret && process.env.NODE_ENV === "development";

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

export function getPayloadAmount(payload: BmcWebhookPayload) {
  return Number(payload.amount ?? payload.total_amount ?? 0);
}

export function getWebhookExternalId(
  event: string | null,
  payload: BmcWebhookPayload,
) {
  if (payload.psp_id) {
    const period = payload.current_period_start ?? payload.created_at ?? "";
    return `bmc:${event ?? "event"}:${payload.psp_id}:${period}`;
  }

  return (
    payload.transaction_id ??
    payload.payment_id ??
    `bmc:${payload.supporter_email}:${payload.support_created_on ?? payload.created_at}:${getPayloadAmount(payload)}`
  );
}
