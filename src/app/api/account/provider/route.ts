import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { isBingWebmasterEnabled } from "@/lib/indexer/bing-webmaster";
import { isGoogleIndexingEnabled } from "@/lib/indexer/google-indexing";
import { getIndexNowKey, getIndexerOrigin } from "@/lib/indexer/config";
import { isVerificationEnabled } from "@/lib/indexer/verify";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireUser();
  if (!auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status! });
  }

  const pendingUrls = await prisma.taskUrl.count({
    where: {
      task: { userId: auth.user.id },
      status: { in: ["pending", "submitted", "discovered", "processing"] },
    },
  });

  return NextResponse.json({
    mode: "self-hosted",
    origin: getIndexerOrigin(),
    indexnowConfigured: Boolean(getIndexNowKey()),
    bingWebmasterConfigured: isBingWebmasterEnabled(),
    googleIndexingConfigured: isGoogleIndexingEnabled(),
    verificationEnabled: isVerificationEnabled(),
    pendingUrls,
  });
}
