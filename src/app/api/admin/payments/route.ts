import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status! });
  }

  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const filter = request.nextUrl.searchParams.get("filter") ?? "all";
  const page = Math.max(1, Number(request.nextUrl.searchParams.get("page") ?? 1));
  const limit = Math.min(50, Math.max(10, Number(request.nextUrl.searchParams.get("limit") ?? 20)));
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (q) {
    where.email = { contains: q, mode: "insensitive" };
  }
  if (filter === "unreconciled") {
    where.OR = [{ userId: null }, { creditsAdded: 0, intendedCredits: { gt: 0 } }];
  }

  const [payments, total] = await Promise.all([
    prisma.paymentEvent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: { user: { select: { id: true, email: true } } },
    }),
    prisma.paymentEvent.count({ where }),
  ]);

  return NextResponse.json({
    payments: payments.map((p) => ({
      id: p.id,
      externalId: p.externalId,
      email: p.email,
      userId: p.userId,
      userEmail: p.user?.email ?? null,
      amountUsd: p.amountUsd,
      creditsAdded: p.creditsAdded,
      intendedCredits: p.intendedCredits,
      planId: p.planId,
      eventType: p.eventType,
      provider: p.provider,
      createdAt: p.createdAt.toISOString(),
    })),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}
