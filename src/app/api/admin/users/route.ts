import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status! });
  }

  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const page = Math.max(1, Number(request.nextUrl.searchParams.get("page") ?? 1));
  const limit = Math.min(50, Math.max(10, Number(request.nextUrl.searchParams.get("limit") ?? 20)));
  const skip = (page - 1) * limit;

  const where = q
    ? {
        OR: [
          { email: { contains: q, mode: "insensitive" as const } },
          { name: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        creditBalance: true,
        googleId: true,
        password: true,
        createdAt: true,
        _count: { select: { tasks: true, paymentEvents: true, sessions: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const userIds = users.map((u) => u.id);
  const linkCounts =
    userIds.length > 0
      ? await prisma.task.groupBy({
          by: ["userId"],
          where: { userId: { in: userIds } },
          _sum: { urlsCount: true },
        })
      : [];
  const linksByUser = Object.fromEntries(
    linkCounts.map((r) => [r.userId, r._sum.urlsCount ?? 0]),
  );

  return NextResponse.json({
    users: users.map(({ password, googleId, ...u }) => ({
      ...u,
      linkCount: linksByUser[u.id] ?? 0,
      authMethod: googleId ? (password ? "google+password" : "google") : "password",
      createdAt: u.createdAt.toISOString(),
    })),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}
