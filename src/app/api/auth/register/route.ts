import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession, hashPassword } from "@/lib/auth";
import { SIGNUP_BONUS_CREDITS } from "@/lib/brand";
import { addCredits } from "@/lib/credits";
import { prisma } from "@/lib/prisma";
import { assertCanCreateAccount, recordSignupDevice } from "@/lib/signup-guard";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
  deviceId: z.string().min(8).max(128).optional(),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const email = body.email.toLowerCase().trim();

    const guard = await assertCanCreateAccount({
      request,
      email,
      deviceId: body.deviceId,
    });
    if (!guard.ok) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }

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

    await recordSignupDevice({
      userId: user.id,
      deviceId: guard.deviceId,
      deviceHash: guard.deviceHash,
      ipHash: guard.ipHash,
    });

    if (SIGNUP_BONUS_CREDITS > 0) {
      await addCredits(
        user.id,
        SIGNUP_BONUS_CREDITS,
        "signup_bonus",
        `Welcome bonus — ${SIGNUP_BONUS_CREDITS} free credits`,
      );
    }

    await createSession(user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
