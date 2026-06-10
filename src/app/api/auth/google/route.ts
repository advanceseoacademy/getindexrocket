import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession } from "@/lib/auth";
import { verifyGoogleIdToken } from "@/lib/google-auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  credential: z.string().min(1),
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
      const user = await prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          googleId: profile.googleId,
          creditBalance: 0,
        },
      });
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
