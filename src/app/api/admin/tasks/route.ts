import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status! });
  }

  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const status = request.nextUrl.searchParams.get("status")?.trim() ?? "";
  const page = Math.max(1, Number(request.nextUrl.searchParams.get("page") ?? 1));
  const limit = Math.min(50, Math.max(10, Number(request.nextUrl.searchParams.get("limit") ?? 20)));
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { externalId: { contains: q, mode: "insensitive" } },
      { providerTaskId: { contains: q, mode: "insensitive" } },
      { user: { email: { contains: q, mode: "insensitive" } } },
      { urls: { some: { url: { contains: q, mode: "insensitive" } } } },
    ];
  }

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        user: { select: { id: true, email: true } },
        urls: {
          orderBy: { createdAt: "asc" },
          select: { id: true, url: true, status: true, indexedAt: true, createdAt: true },
        },
        _count: { select: { urls: true } },
      },
    }),
    prisma.task.count({ where }),
  ]);

  return NextResponse.json({
    tasks: tasks.map((t) => ({
      id: t.id,
      externalId: t.externalId,
      providerTaskId: t.providerTaskId,
      userId: t.userId,
      userEmail: t.user.email,
      tier: t.tier,
      status: t.status,
      urlsCount: t.urlsCount,
      urlCount: t._count.urls,
      creditsCharged: t.creditsCharged,
      createdAt: t.createdAt.toISOString(),
      urls: t.urls.map((u) => ({
        id: u.id,
        url: u.url,
        status: u.status,
        indexedAt: u.indexedAt?.toISOString() ?? null,
        submittedAt: u.createdAt.toISOString(),
      })),
    })),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}
