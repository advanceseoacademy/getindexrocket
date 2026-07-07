import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  isTicketPriority,
  isTicketStatus,
  serializeTicket,
} from "@/lib/tickets";

const patchSchema = z.object({
  status: z.string().optional(),
  priority: z.string().optional(),
});

const replySchema = z.object({
  body: z.string().trim().min(1).max(10000),
  status: z.string().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const auth = await requireAdmin();
  if (!auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status! });
  }

  const { id } = await params;

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      user: { select: { email: true } },
      messages: { orderBy: { createdAt: "asc" } },
      _count: { select: { messages: true } },
    },
  });

  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  return NextResponse.json({ ticket: serializeTicket(ticket, true) });
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const auth = await requireAdmin();
  if (!auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status! });
  }

  const { id } = await params;

  try {
    const body = patchSchema.parse(await request.json());

    if (body.status && !isTicketStatus(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    if (body.priority && !isTicketPriority(body.priority)) {
      return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: {
        ...(body.status ? { status: body.status } : {}),
        ...(body.priority ? { priority: body.priority } : {}),
        updatedAt: new Date(),
      },
      include: {
        user: { select: { email: true } },
        messages: { orderBy: { createdAt: "asc" } },
        _count: { select: { messages: true } },
      },
    });

    return NextResponse.json({ ticket: serializeTicket(ticket, true) });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  const auth = await requireAdmin();
  if (!auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status! });
  }

  const { id } = await params;

  try {
    const body = replySchema.parse(await request.json());

    if (body.status && !isTicketStatus(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const existing = await prisma.supportTicket.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const nextStatus = body.status ?? (existing.status === "open" ? "in_progress" : existing.status);

    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: {
        status: nextStatus,
        updatedAt: new Date(),
        messages: {
          create: {
            authorId: auth.user.id,
            body: body.body,
            isStaff: true,
          },
        },
      },
      include: {
        user: { select: { email: true } },
        messages: { orderBy: { createdAt: "asc" } },
        _count: { select: { messages: true } },
      },
    });

    return NextResponse.json({ ticket: serializeTicket(ticket, true) });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to send reply" }, { status: 500 });
  }
}
