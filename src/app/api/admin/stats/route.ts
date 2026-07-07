import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { isBingWebmasterEnabled } from "@/lib/indexer/bing-webmaster";
import { isGoogleIndexingEnabled } from "@/lib/indexer/google-indexing";
import { getIndexNowKey, getIndexerOrigin } from "@/lib/indexer/config";
import { isVerificationEnabled } from "@/lib/indexer/verify";
import { prisma } from "@/lib/prisma";

type CountRow = {
  users: number | bigint;
  admins: number | bigint;
  new_users_30d: number | bigint;
  total_credits: number | bigint;
  tasks: number | bigint;
  tasks_30d: number | bigint;
  payments: number | bigint;
  unreconciled: number | bigint;
  active_memberships: number | bigint;
};

function toNum(value: unknown): number {
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

async function loadCounts(since30: Date): Promise<CountRow> {
  const defaults: CountRow = {
    users: 0,
    admins: 0,
    new_users_30d: 0,
    total_credits: 0,
    tasks: 0,
    tasks_30d: 0,
    payments: 0,
    unreconciled: 0,
    active_memberships: 0,
  };

  try {
    const [row] = await prisma.$queryRaw<CountRow[]>`
      SELECT
        (SELECT COUNT(*)::int FROM "User") AS users,
        (SELECT COUNT(*)::int FROM "User" WHERE role = 'admin') AS admins,
        (SELECT COUNT(*)::int FROM "User" WHERE "createdAt" >= ${since30}) AS new_users_30d,
        (SELECT COALESCE(SUM("creditBalance"), 0)::int FROM "User") AS total_credits,
        (SELECT COUNT(*)::int FROM "Task") AS tasks,
        (SELECT COUNT(*)::int FROM "Task" WHERE "createdAt" >= ${since30}) AS tasks_30d,
        (SELECT COUNT(*)::int FROM "PaymentEvent") AS payments,
        (SELECT COUNT(*)::int FROM "PaymentEvent"
          WHERE "userId" IS NULL OR ("creditsAdded" = 0 AND "intendedCredits" > 0)
        ) AS unreconciled,
        (SELECT COUNT(*)::int FROM "Membership"
          WHERE status = 'active' AND "canceledAt" IS NULL
        ) AS active_memberships
    `;
    return row ?? defaults;
  } catch {
    const [row] = await prisma.$queryRaw<CountRow[]>`
      SELECT
        (SELECT COUNT(*)::int FROM "User") AS users,
        0::int AS admins,
        (SELECT COUNT(*)::int FROM "User" WHERE "createdAt" >= ${since30}) AS new_users_30d,
        (SELECT COALESCE(SUM("creditBalance"), 0)::int FROM "User") AS total_credits,
        (SELECT COUNT(*)::int FROM "Task") AS tasks,
        (SELECT COUNT(*)::int FROM "Task" WHERE "createdAt" >= ${since30}) AS tasks_30d,
        (SELECT COUNT(*)::int FROM "PaymentEvent") AS payments,
        (SELECT COUNT(*)::int FROM "PaymentEvent"
          WHERE "userId" IS NULL OR ("creditsAdded" = 0 AND "intendedCredits" > 0)
        ) AS unreconciled,
        0::int AS active_memberships
    `;
    return row ?? defaults;
  }
}

async function indexerHealth() {
  const [pendingUrls, activeHubs] = await Promise.all([
    prisma.taskUrl.count({
      where: { status: { in: ["pending", "submitted", "discovered", "processing"] } },
    }),
    prisma.taskUrl.count({ where: { hubToken: { not: null } } }),
  ]);

  return {
    mode: "self-hosted",
    origin: getIndexerOrigin(),
    indexnowConfigured: Boolean(getIndexNowKey()),
    bingWebmasterConfigured: isBingWebmasterEnabled(),
    googleIndexingConfigured: isGoogleIndexingEnabled(),
    verificationEnabled: isVerificationEnabled(),
    pendingUrls,
    activeHubs,
  };
}

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin();
    if (!auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status! });
    }

    const includeProvider = new URL(request.url).searchParams.get("provider") === "1";
    if (includeProvider) {
      const health = await indexerHealth();
      return NextResponse.json({
        credits: {
          providerBalance: null,
          providerEmail: `Self-hosted · ${health.pendingUrls} pending`,
          indexer: health,
        },
      });
    }

    const since30 = new Date();
    since30.setDate(since30.getDate() - 30);

    const [counts, revenueAgg, recentPayments] = await Promise.all([
      loadCounts(since30),
      prisma.paymentEvent.aggregate({
        _sum: { amountUsd: true, creditsAdded: true },
        where: { createdAt: { gte: since30 } },
      }),
      prisma.paymentEvent.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          email: true,
          amountUsd: true,
          creditsAdded: true,
          intendedCredits: true,
          eventType: true,
          createdAt: true,
          user: { select: { email: true } },
        },
      }),
    ]);

    return NextResponse.json({
      users: {
        total: toNum(counts.users),
        admins: toNum(counts.admins),
        new30d: toNum(counts.new_users_30d),
      },
      credits: {
        totalUserBalance: toNum(counts.total_credits),
        providerBalance: null,
        providerEmail: "Self-hosted indexer",
      },
      tasks: { total: toNum(counts.tasks), last30d: toNum(counts.tasks_30d) },
      payments: {
        total: toNum(counts.payments),
        unreconciled: toNum(counts.unreconciled),
        revenue30d: toNum(revenueAgg._sum.amountUsd),
        creditsSold30d: toNum(revenueAgg._sum.creditsAdded),
      },
      memberships: { active: toNum(counts.active_memberships) },
      recentPayments: recentPayments.map((p) => ({
        id: p.id,
        email: p.email,
        userEmail: p.user?.email ?? null,
        amountUsd: p.amountUsd,
        creditsAdded: p.creditsAdded,
        intendedCredits: p.intendedCredits,
        eventType: p.eventType,
        createdAt: p.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error("[admin/stats]", err);
    return NextResponse.json({ error: "Failed to load admin stats" }, { status: 500 });
  }
}
