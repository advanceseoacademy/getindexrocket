import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeTicket } from "@/lib/tickets";

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
      { subject: { contains: q, mode: "insensitive" } },
      { user: { email: { contains: q, mode: "insensitive" } } },
      { id: { contains: q, mode: "insensitive" } },
    ];
  }

  const [tickets, total] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
      include: {
        user: { select: { email: true } },
        _count: { select: { messages: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    }),
    prisma.supportTicket.count({ where }),
  ]);

  return NextResponse.json({
    tickets: tickets.map((t: (typeof tickets)[number]) => serializeTicket(t)),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}
