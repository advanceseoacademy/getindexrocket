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
    },
    orderBy: [{ nextRunAt: "asc" }, { createdAt: "asc" }],
    take: limit,
    include: {
      task: { select: { id: true, userId: true, smartVerification: true } },
    },
  });

  const toIndexNow: { id: string; hubToken: string }[] = [];

  for (const row of pending) {
    result.processed += 1;
    const verifyTask = shouldVerifyForTask(row.task.smartVerification);

    try {
      if (isTerminalStatus(row.status)) continue;

      if (!row.indexNowAt && row.hubToken) {
        toIndexNow.push({ id: row.id, hubToken: row.hubToken });
        continue;
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

  if (toIndexNow.length > 0) {
    const hubUrls = toIndexNow.map((r) => getHubUrl(r.hubToken));
    const discovery = await submitHubUrlsForDiscovery(hubUrls);

    if (discovery.ok || discovery.indexNowSubmitted > 0 || discovery.bingSubmitted > 0 || discovery.googleSubmitted > 0) {
      result.indexNowSubmitted = discovery.indexNowSubmitted;
      result.bingSubmitted = discovery.bingSubmitted;
      result.googleSubmitted = discovery.googleSubmitted;
      await prisma.taskUrl.updateMany({
        where: { id: { in: toIndexNow.map((r) => r.id) } },
        data: {
          indexNowAt: now,
          status: "submitted",
          attempts: { increment: 1 },
          nextRunAt: new Date(now.getTime() + RETRY_DELAY_MS),
          lastError: discovery.errors[0] ?? null,
        },
      });

      for (const row of toIndexNow) {
        const taskId = pending.find((p) => p.id === row.id)?.task.id;
        if (taskId) await refreshTaskAggregateStatus(taskId);
      }

      await pingDiscoveryEndpoints();
    } else if (discovery.errors.length > 0) {
      result.errors.push(...discovery.errors);
      await prisma.taskUrl.updateMany({
        where: { id: { in: toIndexNow.map((r) => r.id) } },
        data: {
          attempts: { increment: 1 },
          lastError: discovery.errors[0],
          nextRunAt: new Date(now.getTime() + RETRY_DELAY_MS),
        },
      });
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

  const needsIndexNow = urls.filter((u) => !u.indexNowAt && u.hubToken);
  if (needsIndexNow.length > 0) {
    const hubUrls = needsIndexNow.map((u) => getHubUrl(u.hubToken!));
    const discovery = await submitHubUrlsForDiscovery(hubUrls);
    if (discovery.ok || discovery.indexNowSubmitted > 0 || discovery.bingSubmitted > 0 || discovery.googleSubmitted > 0) {
      result.indexNowSubmitted = discovery.indexNowSubmitted;
      result.bingSubmitted = discovery.bingSubmitted;
      result.googleSubmitted = discovery.googleSubmitted;
      await prisma.taskUrl.updateMany({
        where: { id: { in: needsIndexNow.map((u) => u.id) } },
        data: {
          indexNowAt: now,
          status: "submitted",
          attempts: { increment: 1 },
          nextRunAt: new Date(now.getTime() + RETRY_DELAY_MS),
          lastError: discovery.errors[0] ?? null,
        },
      });
      await pingDiscoveryEndpoints();
    } else if (discovery.errors.length > 0) {
      result.errors.push(...discovery.errors);
      await prisma.taskUrl.updateMany({
        where: { id: { in: needsIndexNow.map((u) => u.id) } },
        data: {
          attempts: { increment: 1 },
          lastError: discovery.errors[0],
          nextRunAt: new Date(now.getTime() + RETRY_DELAY_MS),
        },
      });
    }
  }

  await evaluateTask(taskId);
  await refreshTaskAggregateStatus(taskId);
  return result;
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
