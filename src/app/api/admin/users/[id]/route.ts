import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { addCredits, deductCredits } from "@/lib/credits";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const auth = await requireAdmin();
  if (!auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status! });
  }

  const { id } = await context.params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      creditBalance: true,
      googleId: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { tasks: true, sessions: true, paymentEvents: true, memberships: true } },
      creditTransactions: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          amount: true,
          balanceAfter: true,
          type: true,
          description: true,
          createdAt: true,
        },
      },
      paymentEvents: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          amountUsd: true,
          creditsAdded: true,
          intendedCredits: true,
          eventType: true,
          createdAt: true,
        },
      },
      memberships: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          levelName: true,
          status: true,
          amountUsd: true,
          cancelAtPeriodEnd: true,
          currentPeriodEnd: true,
          createdAt: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      creditTransactions: user.creditTransactions.map((t) => ({
        ...t,
        createdAt: t.createdAt.toISOString(),
      })),
      paymentEvents: user.paymentEvents.map((p) => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
      })),
      memberships: user.memberships.map((m) => ({
        ...m,
        currentPeriodEnd: m.currentPeriodEnd?.toISOString() ?? null,
        createdAt: m.createdAt.toISOString(),
      })),
    },
  });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await requireAdmin();
  if (!auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status! });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  if (!body?.action) {
    return NextResponse.json({ error: "Missing action" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id }, select: { id: true, email: true } });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (body.action === "grant_credits") {
    const amount = Number(body.amount);
    if (!Number.isInteger(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }
    const desc = body.description?.trim() || `Admin grant by ${auth.user.email}`;
    const balanceAfter = await addCredits(id, amount, "admin_grant", desc);
    return NextResponse.json({ ok: true, creditBalance: balanceAfter });
  }

  if (body.action === "deduct_credits") {
    const amount = Number(body.amount);
    if (!Number.isInteger(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }
    const desc = body.description?.trim() || `Admin deduction by ${auth.user.email}`;
    try {
      const balanceAfter = await deductCredits(id, amount, "admin_deduct", desc);
      return NextResponse.json({ ok: true, creditBalance: balanceAfter });
    } catch {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 400 });
    }
  }

  if (body.action === "set_role") {
    const role = body.role === "admin" ? "admin" : "user";
    if (id === auth.user.id && role !== "admin") {
      return NextResponse.json({ error: "Cannot demote yourself" }, { status: 400 });
    }
    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, role: true, creditBalance: true },
    });
    return NextResponse.json({ ok: true, user: updated });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
