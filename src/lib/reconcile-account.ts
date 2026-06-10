import { addCredits } from "./credits";
import { creditsForAmount, CREDIT_PLANS } from "./pricing-plans";
import { prisma } from "./prisma";

function creditsForPaymentEvent(event: {
  amountUsd: number;
  creditsAdded: number;
  intendedCredits: number;
  planId: string | null;
  eventType: string | null;
}): number {
  if (event.creditsAdded > 0) return 0;
  if (event.eventType === "membership.cancelled") return 0;
  if (event.intendedCredits > 0) return event.intendedCredits;

  const plan = event.planId
    ? CREDIT_PLANS.find((p) => p.id === event.planId)
    : null;

  if (event.eventType === "membership.updated") return 0;

  return creditsForAmount(event.amountUsd, plan?.name);
}

export async function reconcileUserAccount(userId: string, email: string) {
  const normalizedEmail = email.toLowerCase().trim();
  let totalCredited = 0;

  await prisma.membership.updateMany({
    where: { email: normalizedEmail, userId: null },
    data: { userId },
  });

  const pendingPayments = await prisma.paymentEvent.findMany({
    where: {
      email: normalizedEmail,
      creditsAdded: 0,
      NOT: { eventType: "membership.cancelled" },
    },
    orderBy: { createdAt: "asc" },
  });

  for (const event of pendingPayments) {
    const credits = creditsForPaymentEvent(event);
    if (credits <= 0) continue;

    await addCredits(
      userId,
      credits,
      "payment_reconcile",
      `Reconciled payment ${event.externalId}`,
    );

    await prisma.paymentEvent.update({
      where: { id: event.id },
      data: {
        userId,
        creditsAdded: credits,
        intendedCredits: event.intendedCredits > 0 ? event.intendedCredits : credits,
      },
    });

    totalCredited += credits;
  }

  return { totalCredited, paymentsReconciled: pendingPayments.length };
}
