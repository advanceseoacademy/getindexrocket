import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { CREDIT_PER_URL } from "@/lib/brand";
import { deductCredits, getCreditCost, refundCredits } from "@/lib/credits";
import { isDiscoveryConfigured } from "@/lib/indexer/discover";
import { generateHubToken } from "@/lib/indexer/hub";
import { processTask } from "@/lib/indexer/run";
import { isVerificationEnabled } from "@/lib/indexer/verify";
import { prisma } from "@/lib/prisma";
import { normalizeUrls } from "@/lib/urls";

const schema = z.object({
  urls: z.string().min(1),
  taskName: z.string().max(120).optional(),
  smartVerification: z.boolean().optional().default(false),
  dripFeed: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
  const auth = await requireUser();
  if (!auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status! });
  }

  if (!isDiscoveryConfigured()) {
    return NextResponse.json(
      {
        error:
          "Indexing service is not configured (set INDEXNOW_KEY and/or Bing Webmaster / Google Indexing API).",
      },
      { status: 503 },
    );
  }

  try {
    const body = schema.parse(await request.json());
    const urls = normalizeUrls(body.urls);
    const taskName = body.taskName?.trim() || undefined;

    if (body.dripFeed) {
      return NextResponse.json(
        { error: "Drip feed is coming soon and is not available yet." },
        { status: 400 },
      );
    }

    if (urls.length === 0) {
      return NextResponse.json({ error: "No valid URLs found" }, { status: 400 });
    }

    const maxUrls = 10000;
    if (urls.length > maxUrls) {
      return NextResponse.json(
        { error: `Maximum ${maxUrls} URLs per submission` },
        { status: 400 },
      );
    }

    if (body.smartVerification && !isVerificationEnabled()) {
      return NextResponse.json(
        {
          error:
            "Smart verification is not available yet (configure GOOGLE_CSE_API_KEY + GOOGLE_CSE_CX or BING_SEARCH_API_KEY).",
        },
        { status: 503 },
      );
    }

    const creditCost = getCreditCost(urls.length, {
      smartVerification: body.smartVerification,
    });
    if (auth.user.creditBalance < creditCost) {
      return NextResponse.json(
        {
          error: `Insufficient credits. Need ${creditCost}, have ${auth.user.creditBalance}`,
        },
        { status: 402 },
      );
    }

    const balanceAfter = await deductCredits(
      auth.user.id,
      creditCost,
      "submit",
      taskName
        ? `${urls.length} URL(s) — ${taskName}`
        : body.smartVerification
          ? `${urls.length} URL(s) + verification`
          : `${urls.length} URL(s)`,
    );

    const now = new Date();
    let task;
    try {
      task = await prisma.task.create({
        data: {
          userId: auth.user.id,
          tier: "standard",
          status: "submitted",
          smartVerification: body.smartVerification,
          urlsCount: urls.length,
          creditsCharged: creditCost,
          providerTaskId: null,
          urls: {
            create: urls.map((url) => ({
              url,
              status: "pending",
              hubToken: generateHubToken(),
              nextRunAt: now,
            })),
          },
        },
        include: { urls: true },
      });

      task = await prisma.task.update({
        where: { id: task.id },
        data: {
          externalId: task.id,
          providerTaskId: task.id.slice(-6).toUpperCase(),
        },
        include: { urls: true },
      });

      const pipeline = await processTask(task.id);

      if (pipeline.errors.length > 0 && pipeline.indexNowSubmitted === 0 && pipeline.bingSubmitted === 0 && pipeline.googleSubmitted === 0) {
        await refundCredits(
          auth.user.id,
          creditCost,
          "Indexing pipeline error — refund",
        );
        await prisma.task.update({
          where: { id: task.id },
          data: { status: "failed" },
        });
        return NextResponse.json(
          { error: pipeline.errors[0] ?? "Indexing pipeline failed" },
          { status: 502 },
        );
      }

      if (pipeline.errors.length > 0) {
        await prisma.task.update({
          where: { id: task.id },
          data: { status: "processing" },
        });
      }
    } catch (err) {
      await refundCredits(
        auth.user.id,
        creditCost,
        "Indexing service error — refund",
      );
      const message = err instanceof Error ? err.message : "Indexing service unavailable";
      return NextResponse.json({ error: message }, { status: 502 });
    }

    const refreshed = await prisma.task.findUnique({
      where: { id: task.id },
      select: { id: true, externalId: true, status: true, urlsCount: true, creditsCharged: true, tier: true },
    });

    return NextResponse.json({
      creditBalance: balanceAfter,
      task: {
        id: refreshed!.id,
        externalId: refreshed!.externalId,
        status: refreshed!.status,
        urlsCount: refreshed!.urlsCount,
        creditsCharged: refreshed!.creditsCharged,
        tier: refreshed!.tier,
        costPerUrl: CREDIT_PER_URL,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}
