import { isTerminalStatus, statusBucket } from "@/lib/indexing-status";
import { refundUrlIfEligible } from "@/lib/credits";
import { REFUND_AFTER_DAYS, RUN_BATCH_SIZE } from "@/lib/indexer/config";
import { refreshTaskAggregateStatus } from "@/lib/indexer/engine";
import { pingDiscoveryEndpoints } from "@/lib/indexer/feeds";
import { submitHubUrlsForDiscovery } from "@/lib/indexer/discover";
import { getHubUrl } from "@/lib/indexer/hub";
import { shouldVerifyForTask, verifyUrlIndexed } from "@/lib/indexer/verify";
import { calculateSubmitCost } from "@/lib/submit-cost";
import { prisma } from "@/lib/prisma";

export type RunIndexerResult = {
  processed: number;
  indexNowSubmitted: number;
  bingSubmitted: number;
  googleSubmitted: number;
  verified: number;
  refunded: number;
  errors: string[];
};

const RETRY_DELAY_MS = 15 * 60 * 1000;

export async function runIndexerBatch(limit = RUN_BATCH_SIZE): Promise<RunIndexerResult> {
  const now = new Date();
  const result: RunIndexerResult = {
    processed: 0,
    indexNowSubmitted: 0,
    bingSubmitted: 0,
    googleSubmitted: 0,
    verified: 0,
    refunded: 0,
    errors: [],
  };

  const pending = await prisma.taskUrl.findMany({
    where: {
      hubToken: { not: null },
      status: { notIn: ["crawled", "refunded", "failed"] },
      OR: [{ nextRunAt: null }, { nextRunAt: { lte: now } }],
    },
    orderBy: [{ nextRunAt: "asc" }, { createdAt: "asc" }],
    take: limit,
    include: {
      task: { select: { id: true, userId: true, smartVerification: true } },
    },
  });

  const toDiscover: { id: string; hubToken: string; firstSubmit: boolean }[] = [];

  for (const row of pending) {
    result.processed += 1;
    const verifyTask = shouldVerifyForTask(row.task.smartVerification);

    try {
      if (isTerminalStatus(row.status)) continue;

      // First discovery push, or re-push until a search bot hits the hub.
      // Important: IndexNow can succeed while Google/Bing fail (ownership / API key).
      // Without rediscovery, stuck URLs never get pushed to fixed channels.
      if (row.hubToken && (!row.indexNowAt || !row.botHitAt)) {
        toDiscover.push({
          id: row.id,
          hubToken: row.hubToken,
          firstSubmit: !row.indexNowAt,
        });
        if (!row.indexNowAt) continue;
      }

      const refundEligible = isRefundEligible(row.createdAt, now);

      await applyBotHitStatus(row, now, verifyTask);

      if (verifyTask && row.botHitAt && !row.verifiedAt) {
        const verify = await verifyUrlIndexed(row.url);
        if (!verify.skipped) {
          if (verify.indexed) {
            await prisma.taskUrl.update({
              where: { id: row.id },
              data: {
                status: "crawled",
                verifiedAt: now,
                indexedAt: row.indexedAt ?? now,
              },
            });
            result.verified += 1;
          } else if (verify.error) {
            result.errors.push(verify.error);
          }
        }
      }

      if (refundEligible && row.indexNowAt && statusBucket(row.status) !== "crawled") {
        const shouldRefund = verifyTask
          ? !row.botHitAt || (!row.verifiedAt && !row.indexedAt)
          : !row.botHitAt;

        if (shouldRefund && statusBucket(row.status) !== "refunded") {
          await markRefunded(
            row.id,
            row.task.userId,
            row.url,
            row.task.smartVerification,
          );
          result.refunded += 1;
        }
      }

      await refreshTaskAggregateStatus(row.task.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Indexer run failed";
      result.errors.push(message);
      await prisma.taskUrl.update({
        where: { id: row.id },
        data: {
          attempts: { increment: 1 },
          lastError: message,
          nextRunAt: new Date(now.getTime() + RETRY_DELAY_MS),
        },
      });
    }
  }

  if (toDiscover.length > 0) {
    const discoveryResult = await pushDiscoveryBatch(toDiscover, now, result);
    result.errors.push(...discoveryResult.errors);

    for (const row of toDiscover) {
      const taskId = pending.find((p) => p.id === row.id)?.task.id;
      if (taskId) await refreshTaskAggregateStatus(taskId);
    }
  }

  return result;
}

export async function evaluateTask(taskId: string): Promise<void> {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { smartVerification: true },
  });
  const verifyTask = shouldVerifyForTask(task?.smartVerification ?? false);

  const urls = await prisma.taskUrl.findMany({
    where: { taskId },
    include: { task: { select: { userId: true } } },
  });

  const now = new Date();
  for (const row of urls) {
    if (isTerminalStatus(row.status)) continue;

    if (!row.indexNowAt) continue;

    if (isRefundEligible(row.createdAt, now) && statusBucket(row.status) !== "crawled") {
      const shouldRefund = verifyTask
        ? !row.botHitAt || (!row.verifiedAt && !row.indexedAt)
        : !row.botHitAt;

      if (shouldRefund && statusBucket(row.status) !== "refunded") {
        await markRefunded(row.id, row.task.userId, row.url, task?.smartVerification ?? false);
      }
      continue;
    }

    if (!verifyTask && row.botHitAt && statusBucket(row.status) !== "crawled") {
      await prisma.taskUrl.update({
        where: { id: row.id },
        data: {
          status: "crawled",
          indexedAt: row.indexedAt ?? row.botHitAt ?? now,
        },
      });
      continue;
    }

    if (verifyTask && row.botHitAt && statusBucket(row.status) !== "crawled") {
      const verify = await verifyUrlIndexed(row.url);
      if (!verify.skipped && verify.indexed) {
        await prisma.taskUrl.update({
          where: { id: row.id },
          data: {
            status: "crawled",
            verifiedAt: now,
            indexedAt: row.indexedAt ?? now,
          },
        });
      }
    }
  }

  await refreshTaskAggregateStatus(taskId);
}

export async function enqueueTaskUrls(taskId: string) {
  await prisma.taskUrl.updateMany({
    where: { taskId },
    data: { nextRunAt: new Date() },
  });
}

/** Process a single task immediately (submit + evaluate). */
export async function processTask(taskId: string): Promise<RunIndexerResult> {
  const urls = await prisma.taskUrl.findMany({
    where: {
      taskId,
      hubToken: { not: null },
      status: { notIn: ["crawled", "refunded", "failed"] },
    },
    include: { task: { select: { id: true, userId: true, smartVerification: true } } },
  });

  if (urls.length === 0) {
    await evaluateTask(taskId);
    await refreshTaskAggregateStatus(taskId);
    return {
      processed: 0,
      indexNowSubmitted: 0,
      bingSubmitted: 0,
      googleSubmitted: 0,
      verified: 0,
      refunded: 0,
      errors: [],
    };
  }

  const now = new Date();
  const result: RunIndexerResult = {
    processed: urls.length,
    indexNowSubmitted: 0,
    bingSubmitted: 0,
    googleSubmitted: 0,
    verified: 0,
    refunded: 0,
    errors: [],
  };

  const needsDiscover = urls
    .filter((u) => u.hubToken && (!u.indexNowAt || !u.botHitAt))
    .map((u) => ({
      id: u.id,
      hubToken: u.hubToken!,
      firstSubmit: !u.indexNowAt,
    }));

  if (needsDiscover.length > 0) {
    const discoveryResult = await pushDiscoveryBatch(needsDiscover, now, result);
    result.errors.push(...discoveryResult.errors);
  }

  await evaluateTask(taskId);
  await refreshTaskAggregateStatus(taskId);
  return result;
}

async function pushDiscoveryBatch(
  rows: { id: string; hubToken: string; firstSubmit: boolean }[],
  now: Date,
  result: RunIndexerResult,
): Promise<{ errors: string[] }> {
  const hubUrls = rows.map((r) => getHubUrl(r.hubToken));
  const discovery = await submitHubUrlsForDiscovery(hubUrls);
  const errors = [...discovery.errors];

  const anySuccess =
    discovery.ok ||
    discovery.indexNowSubmitted > 0 ||
    discovery.bingSubmitted > 0 ||
    discovery.googleSubmitted > 0;

  result.indexNowSubmitted += discovery.indexNowSubmitted;
  result.bingSubmitted += discovery.bingSubmitted;
  result.googleSubmitted += discovery.googleSubmitted;

  // Prefer actionable channel errors; IndexNow-only success is still progress.
  const lastError =
    discovery.googleSubmitted === 0 &&
    discovery.errors.find((e) => /google|permission|ownership/i.test(e))
      ? discovery.errors.find((e) => /google|permission|ownership/i.test(e))!
      : discovery.bingSubmitted === 0 &&
          discovery.errors.find((e) => /bing|apikey|api key/i.test(e))
        ? discovery.errors.find((e) => /bing|apikey|api key/i.test(e))!
        : discovery.errors[0] ?? null;

  if (anySuccess) {
    const firstIds = rows.filter((r) => r.firstSubmit).map((r) => r.id);
    const retryIds = rows.filter((r) => !r.firstSubmit).map((r) => r.id);

    if (firstIds.length > 0) {
      await prisma.taskUrl.updateMany({
        where: { id: { in: firstIds } },
        data: {
          indexNowAt: now,
          status: "submitted",
          attempts: { increment: 1 },
          nextRunAt: new Date(now.getTime() + RETRY_DELAY_MS),
          lastError,
        },
      });
    }

    if (retryIds.length > 0) {
      await prisma.taskUrl.updateMany({
        where: { id: { in: retryIds } },
        data: {
          attempts: { increment: 1 },
          nextRunAt: new Date(now.getTime() + RETRY_DELAY_MS),
          lastError,
        },
      });
    }

    await pingDiscoveryEndpoints();
  } else if (discovery.errors.length > 0) {
    await prisma.taskUrl.updateMany({
      where: { id: { in: rows.map((r) => r.id) } },
      data: {
        attempts: { increment: 1 },
        lastError: discovery.errors[0],
        nextRunAt: new Date(now.getTime() + RETRY_DELAY_MS),
      },
    });
  }

  return { errors };
}

async function applyBotHitStatus(
  row: {
    id: string;
    status: string;
    botHitAt: Date | null;
    indexedAt: Date | null;
  },
  now: Date,
  verifyTask: boolean,
) {
  if (!row.botHitAt || statusBucket(row.status) === "crawled") return;

  if (!verifyTask) {
    await prisma.taskUrl.update({
      where: { id: row.id },
      data: {
        status: "crawled",
        indexedAt: row.indexedAt ?? row.botHitAt ?? now,
      },
    });
    return;
  }

  await prisma.taskUrl.update({
    where: { id: row.id },
    data: { status: "processing" },
  });
}

async function markRefunded(
  taskUrlId: string,
  userId: string,
  url: string,
  smartVerification: boolean,
) {
  await prisma.taskUrl.update({
    where: { id: taskUrlId },
    data: { status: "refunded" },
  });
  const refundAmount = calculateSubmitCost(1, { smartVerification }).total;
  await refundUrlIfEligible(userId, taskUrlId, url, refundAmount);
}

function isRefundEligible(createdAt: Date, now: Date): boolean {
  const ms = REFUND_AFTER_DAYS * 24 * 60 * 60 * 1000;
  return now.getTime() - createdAt.getTime() >= ms;
}
