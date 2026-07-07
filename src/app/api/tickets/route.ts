import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeTicket } from "@/lib/tickets";

const createSchema = z.object({
  subject: z.string().trim().min(3).max(200),
  body: z.string().trim().min(10).max(10000),
});

export async function GET() {
  const auth = await requireUser();
  if (!auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status! });
  }

  const tickets = await prisma.supportTicket.findMany({
    where: { userId: auth.user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { messages: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return NextResponse.json({
    tickets: tickets.map((t: (typeof tickets)[number]) => serializeTicket(t)),
  });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (!auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status! });
  }

  try {
    const body = createSchema.parse(await request.json());

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: auth.user.id,
        subject: body.subject,
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

    return NextResponse.json({ ticket: serializeTicket(ticket, true) }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
  }
}
