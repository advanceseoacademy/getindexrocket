import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAccountBalance } from "@/lib/indexnowfast";
import { prisma } from "@/lib/prisma";

type CountRow = {
  users: number;
  admins: number;
  new_users_30d: number;
  total_credits: number;
  tasks: number;
  tasks_30d: number;
  payments: number;
  unreconciled: number;
  active_memberships: number;
};

async function providerWithTimeout(ms = 2500) {
  try {
    const provider = await Promise.race([
      getAccountBalance(),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("provider timeout")), ms);
      }),
    ]);
    return { providerBalance: provider.credit_balance, providerEmail: provider.email };
  } catch {
    return { providerBalance: null, providerEmail: null };
  }
}

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (!auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status! });
  }

  const includeProvider = new URL(request.url).searchParams.get("provider") === "1";
  if (includeProvider) {
    const credits = await providerWithTimeout();
    return NextResponse.json({ credits });
  }

  const since30 = new Date();
  since30.setDate(since30.getDate() - 30);

  const [[counts], revenueAgg, recentPayments] = await Promise.all([
    prisma.$queryRaw<CountRow[]>`
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
    `,
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

  const c = counts ?? {
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

  return NextResponse.json({
    users: { total: c.users, admins: c.admins, new30d: c.new_users_30d },
    credits: {
      totalUserBalance: c.total_credits,
      providerBalance: null,
      providerEmail: null,
    },
    tasks: { total: c.tasks, last30d: c.tasks_30d },
    payments: {
      total: c.payments,
      unreconciled: c.unreconciled,
      revenue30d: revenueAgg._sum.amountUsd ?? 0,
      creditsSold30d: revenueAgg._sum.creditsAdded ?? 0,
    },
    memberships: { active: c.active_memberships },
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
}
