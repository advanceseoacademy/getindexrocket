import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canUserReply, serializeTicket } from "@/lib/tickets";

const replySchema = z.object({
  body: z.string().trim().min(1).max(10000),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const auth = await requireUser();
  if (!auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status! });
  }

  const { id } = await params;

  const ticket = await prisma.supportTicket.findFirst({
    where: { id, userId: auth.user.id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      _count: { select: { messages: true } },
    },
  });

  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  return NextResponse.json({ ticket: serializeTicket(ticket, true) });
}

export async function POST(request: Request, { params }: RouteContext) {
  const auth = await requireUser();
  if (!auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status! });
  }

  const { id } = await params;

  try {
    const body = replySchema.parse(await request.json());

    const ticket = await prisma.supportTicket.findFirst({
      where: { id, userId: auth.user.id },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    if (!canUserReply(ticket.status)) {
      return NextResponse.json({ error: "This ticket is closed" }, { status: 400 });
    }

    const nextStatus = ticket.status === "resolved" ? "open" : ticket.status;

    const updated = await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: {
        status: nextStatus,
        updatedAt: new Date(),
        messages: {
          create: {
            authorId: auth.user.id,
            body: body.body,
            isStaff: false,
          },
        },
      },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
        _count: { select: { messages: true } },
      },
    });

    return NextResponse.json({ ticket: serializeTicket(updated, true) });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to send reply" }, { status: 500 });
  }
}
