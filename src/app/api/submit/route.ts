import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { CREDIT_PER_URL } from "@/lib/brand";
import { deductCredits, getCreditCost, refundCredits } from "@/lib/credits";
import { submitUrls } from "@/lib/indexnowfast";
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

    let external;
    try {
      external = await submitUrls(urls, "standard");
    } catch (err) {
      await refundCredits(
        auth.user.id,
        creditCost,
        "Indexing service error — refund",
      );
      const message = err instanceof Error ? err.message : "Indexing service unavailable";
      return NextResponse.json({ error: message }, { status: 502 });
    }

    const task = await prisma.task.create({
      data: {
        userId: auth.user.id,
        externalId: external.task_id,
        tier: external.tier ?? "standard",
        status: "processing",
        urlsCount: external.urls_count ?? urls.length,
        creditsCharged: creditCost,
        urls: {
          create: urls.map((url) => ({ url, status: "pending" })),
        },
      },
      include: { urls: true },
    });

    return NextResponse.json({
      creditBalance: balanceAfter,
      task: {
        id: task.id,
        externalId: task.externalId,
        status: task.status,
        urlsCount: task.urlsCount,
        creditsCharged: task.creditsCharged,
        tier: task.tier,
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
