import type { BmcWebhookPayload } from "./buymeacoffee";
import { getPayloadAmount } from "./buymeacoffee";
import { addCredits } from "./credits";
import { creditsForAmount, getPlanByMembershipName } from "./pricing-plans";
import { prisma } from "./prisma";

function parseDate(value?: string | null) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function isTruthy(value?: string | boolean | null) {
  return value === true || value === "true" || value === "1";
}

async function upsertMembership(
  email: string,
  userId: string | null,
  payload: BmcWebhookPayload,
  status: string,
) {
  const subId = payload.psp_id;
  if (!subId) return null;

  const data = {
    email,
    userId,
    levelName: payload.membership_level_name ?? null,
    levelId: payload.membership_level_id ?? null,
    status,
    amountUsd: getPayloadAmount(payload),
    canceledAt: parseDate(payload.canceled_at),
    currentPeriodStart: parseDate(payload.current_period_start),
    currentPeriodEnd: parseDate(payload.current_period_end),
    paused: isTruthy(payload.paused),
    cancelAtPeriodEnd: isTruthy(payload.cancel_at_period_end),
  };

  return prisma.membership.upsert({
    where: { externalSubId: subId },
    create: { externalSubId: subId, ...data },
    update: data,
  });
}

export async function handleMembershipStarted(
  payload: BmcWebhookPayload,
  externalId: string,
) {
  const email = payload.supporter_email!.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });
  const plan = getPlanByMembershipName(payload.membership_level_name);
  const amountUsd = getPayloadAmount(payload);
  const credits = creditsForAmount(amountUsd, payload.membership_level_name);

  await upsertMembership(email, user?.id ?? null, payload, payload.status ?? "active");

  if (user && credits > 0) {
    await addCredits(
      user.id,
      credits,
      "bmc_membership_started",
      `Membership started: ${payload.membership_level_name ?? plan?.name ?? "plan"}`,
    );
  }

  await prisma.paymentEvent.create({
    data: {
      externalId,
      userId: user?.id ?? null,
      email,
      amountUsd,
      creditsAdded: user ? credits : 0,
      planId: plan?.id ?? null,
      eventType: "membership.started",
    },
  });

  return { credited: !!user, credits, email, status: "started" };
}

export async function handleMembershipUpdated(
  payload: BmcWebhookPayload,
  externalId: string,
) {
  const email = payload.supporter_email!.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });
  const plan = getPlanByMembershipName(payload.membership_level_name);
  const amountUsd = getPayloadAmount(payload);
  const credits = creditsForAmount(amountUsd, payload.membership_level_name);
  const status = payload.status ?? "active";

  await upsertMembership(email, user?.id ?? null, payload, status);

  const shouldCredit =
    user &&
    credits > 0 &&
    status === "active" &&
    !isTruthy(payload.paused) &&
    !isTruthy(payload.canceled);

  if (shouldCredit) {
    await addCredits(
      user.id,
      credits,
      "bmc_membership_renewal",
      `Membership renewed: ${payload.membership_level_name ?? plan?.name ?? "plan"}`,
    );
  }

  await prisma.paymentEvent.create({
    data: {
      externalId,
      userId: user?.id ?? null,
      email,
      amountUsd,
      creditsAdded: shouldCredit ? credits : 0,
      planId: plan?.id ?? null,
      eventType: "membership.updated",
    },
  });

  return { credited: !!shouldCredit, credits: shouldCredit ? credits : 0, email, status: "updated" };
}

export async function handleMembershipCancelled(
  payload: BmcWebhookPayload,
  externalId: string,
) {
  const email = payload.supporter_email!.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });

  await upsertMembership(email, user?.id ?? null, payload, "cancelled");

  await prisma.paymentEvent.create({
    data: {
      externalId,
      userId: user?.id ?? null,
      email,
      amountUsd: getPayloadAmount(payload),
      creditsAdded: 0,
      planId: getPlanByMembershipName(payload.membership_level_name)?.id ?? null,
      eventType: "membership.cancelled",
    },
  });

  return { credited: false, credits: 0, email, status: "cancelled" };
}
