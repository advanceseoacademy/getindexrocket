import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession } from "@/lib/auth";
import { SIGNUP_BONUS_CREDITS } from "@/lib/brand";
import { addCredits } from "@/lib/credits";
import { verifyGoogleIdToken } from "@/lib/google-auth";
import { prisma } from "@/lib/prisma";
import { assertCanCreateAccount, recordSignupDevice } from "@/lib/signup-guard";

const schema = z.object({
  credential: z.string().min(1),
  deviceId: z.string().min(8).max(128).optional(),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const profile = await verifyGoogleIdToken(body.credential);

    if (!profile.emailVerified) {
      return NextResponse.json(
        { error: "Please verify your Google email before signing in." },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({ where: { email: profile.email } });

    if (!existing) {
      const guard = await assertCanCreateAccount({
        request,
        email: profile.email,
        deviceId: body.deviceId,
      });
      if (!guard.ok) {
        return NextResponse.json({ error: guard.error }, { status: guard.status });
      }

      const user = await prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          googleId: profile.googleId,
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
    }

    if (existing.googleId && existing.googleId !== profile.googleId) {
      return NextResponse.json(
        { error: "This email is linked to a different Google account." },
        { status: 400 },
      );
    }

    if (!existing.googleId) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          googleId: profile.googleId,
          name: existing.name ?? profile.name,
        },
      });
    }

    await createSession(existing.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    if (err instanceof Error && err.message.includes("not configured")) {
      return NextResponse.json({ error: "Google sign-in is not configured" }, { status: 503 });
    }
    return NextResponse.json({ error: "Google sign-in failed" }, { status: 401 });
  }
}
