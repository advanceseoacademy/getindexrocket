import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const email = body.email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      if (existing.googleId && !existing.password) {
        return NextResponse.json(
          { error: "This email uses Google sign-in. Please continue with Google." },
          { status: 400 },
        );
      }
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const password = await hashPassword(body.password);
    const user = await prisma.user.create({
      data: {
        email,
        name: body.name?.trim() || null,
        password,
        creditBalance: 0,
      },
    });

    await createSession(user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
