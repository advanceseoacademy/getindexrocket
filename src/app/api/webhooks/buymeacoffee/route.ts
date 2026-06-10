import { NextResponse } from "next/server";
import {
  BMC_EVENTS,
  getPayloadAmount,
  getWebhookExternalId,
  verifyBmcSignature,
  type BmcWebhookPayload,
} from "@/lib/buymeacoffee";
import { addCredits } from "@/lib/credits";
import {
  handleMembershipCancelled,
  handleMembershipStarted,
  handleMembershipUpdated,
} from "@/lib/membership";
import { creditsForAmount, getPlanByAmount } from "@/lib/pricing-plans";
import { prisma } from "@/lib/prisma";

async function handleCoffeePurchase(payload: BmcWebhookPayload, externalId: string) {
  const amountUsd = getPayloadAmount(payload);
  const credits = creditsForAmount(amountUsd);
  if (credits <= 0) {
    return { ok: true, skipped: "zero credits" };
  }

  const email = payload.supporter_email!.toLowerCase().trim();
  const existing = await prisma.paymentEvent.findUnique({ where: { externalId } });
  if (existing) {
    return { ok: true, duplicate: true };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const plan = getPlanByAmount(amountUsd);

  if (user) {
    await addCredits(
      user.id,
      credits,
      "bmc_purchase",
      `Buy Me a Coffee $${amountUsd} (${plan?.name ?? "custom"})`,
    );
  }

  await prisma.paymentEvent.create({
    data: {
      externalId,
      userId: user?.id ?? null,
      email,
      amountUsd,
      intendedCredits: credits,
      creditsAdded: user ? credits : 0,
      planId: plan?.id ?? null,
      eventType: "coffee.purchase",
    },
  });

  return { ok: true, credited: !!user, credits, email };
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-bmc-signature");
  const event = request.headers.get("x-bmc-event");

  if (!verifyBmcSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: { response?: BmcWebhookPayload };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payload = body.response;
  if (!payload?.supporter_email) {
    return NextResponse.json({ ok: true, skipped: "no email" });
  }

  const externalId = getWebhookExternalId(event, payload);
  const existing = await prisma.paymentEvent.findUnique({ where: { externalId } });
  if (existing) {
    return NextResponse.json({ ok: true, duplicate: true, event });
  }

  try {
    switch (event) {
      case BMC_EVENTS.membershipStarted:
        return NextResponse.json(
          await handleMembershipStarted(payload, externalId),
        );
      case BMC_EVENTS.membershipUpdated:
        return NextResponse.json(
          await handleMembershipUpdated(payload, externalId),
        );
      case BMC_EVENTS.membershipCancelled:
        return NextResponse.json(
          await handleMembershipCancelled(payload, externalId),
        );
      case BMC_EVENTS.coffeePurchase:
      case BMC_EVENTS.coffeeLinkPurchase:
        return NextResponse.json(await handleCoffeePurchase(payload, externalId));
      default:
        return NextResponse.json({ ok: true, skipped: event ?? "unknown" });
    }
  } catch (err) {
    console.error("BMC webhook error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
