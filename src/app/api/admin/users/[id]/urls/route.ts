import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await requireAdmin();
  if (!auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status! });
  }

  const { id } = await context.params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const page = Math.max(1, Number(request.nextUrl.searchParams.get("page") ?? 1));
  const limit = Math.min(100, Math.max(10, Number(request.nextUrl.searchParams.get("limit") ?? 50)));
  const skip = (page - 1) * limit;

  const where = {
    task: { userId: id },
    ...(q ? { url: { contains: q, mode: "insensitive" as const } } : {}),
  };

  const [urls, total, totalAll] = await Promise.all([
    prisma.taskUrl.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        url: true,
        status: true,
        indexedAt: true,
        createdAt: true,
        task: {
          select: {
            id: true,
            status: true,
            tier: true,
            providerTaskId: true,
            createdAt: true,
          },
        },
      },
    }),
    prisma.taskUrl.count({ where }),
    prisma.taskUrl.count({ where: { task: { userId: id } } }),
  ]);

  return NextResponse.json({
    user: { id: user.id, email: user.email },
    urls: urls.map((u) => ({
      id: u.id,
      url: u.url,
      status: u.status,
      indexedAt: u.indexedAt?.toISOString() ?? null,
      submittedAt: u.createdAt.toISOString(),
      task: {
        id: u.task.id,
        status: u.task.status,
        tier: u.task.tier,
        providerTaskId: u.task.providerTaskId,
        createdAt: u.task.createdAt.toISOString(),
      },
    })),
    totalLinks: totalAll,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}
