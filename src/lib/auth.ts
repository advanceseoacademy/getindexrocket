import { cache } from "react";
import { cookies } from "next/headers";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";
import { reconcileUserAccount } from "./reconcile-account";
import { prisma } from "./prisma";

const SESSION_COOKIE = "gir_session";
const USER_COOKIE = "gir_user";
const AUTH_FLAG_COOKIE = "gir_auth";
const SESSION_DAYS = 30;
const USER_CACHE_MS = 5 * 60 * 1000;

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  creditBalance: number;
};

type UserCachePayload = SessionUser & { cachedAt: number };

const USER_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  creditBalance: true,
} as const;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function getSecret() {
  return (
    process.env.SESSION_SECRET ??
    process.env.BMC_WEBHOOK_SECRET ??
    "dev-insecure-session-secret"
  );
}

function encodeUserCookie(user: SessionUser) {
  const payload: UserCachePayload = { ...user, cachedAt: Date.now() };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", getSecret()).update(data).digest("base64url");
  return `${data}.${sig}`;
}

function decodeUserCookie(value: string): UserCachePayload | null {
  const dot = value.lastIndexOf(".");
  if (dot === -1) return null;

  const data = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  const expected = createHmac("sha256", getSecret()).update(data).digest("base64url");

  try {
    if (
      sig.length !== expected.length ||
      !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
    ) {
      return null;
    }
  } catch {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(data, "base64url").toString()) as UserCachePayload;
  } catch {
    return null;
  }
}

async function setAuthFlag() {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_FLAG_COOKIE, "1", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

async function setUserCookie(user: SessionUser) {
  const cookieStore = await cookies();
  cookieStore.set(USER_COOKIE, encodeUserCookie(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  await setAuthFlag();
}

async function clearUserCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(USER_COOKIE);
  cookieStore.delete(AUTH_FLAG_COOKIE);
}

async function loadUserFromDb(token: string): Promise<SessionUser | null> {
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: { select: USER_SELECT } },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }
    return null;
  }

  return session.user;
}

export async function refreshUserCache(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: USER_SELECT,
  });
  if (user) await setUserCookie(user);
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);

  await prisma.session.create({
    data: { userId, tokenHash: hashToken(token), expiresAt },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: USER_SELECT,
  });
  if (user) {
    await reconcileUserAccount(user.id, user.email);
    const refreshed = await prisma.user.findUnique({
      where: { id: userId },
      select: USER_SELECT,
    });
    if (refreshed) await setUserCookie(refreshed);
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({
      where: { tokenHash: hashToken(token) },
    });
  }
  cookieStore.delete(SESSION_COOKIE);
  await clearUserCookie();
}

export const getSessionUser = cache(async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const cached = cookieStore.get(USER_COOKIE)?.value;
  if (cached) {
    const payload = decodeUserCookie(cached);
    if (payload && Date.now() - payload.cachedAt < USER_CACHE_MS) {
      const { cachedAt: _, ...user } = payload;
      return user;
    }
  }

  const user = await loadUserFromDb(token);
  if (user) await setUserCookie(user);
  return user;
});

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) {
    return { error: "Unauthorized" as const, status: 401 as const, user: null };
  }
  return { user, error: null, status: null };
}

export function isAdmin(user: SessionUser | null | undefined) {
  return user?.role === "admin";
}

export async function requireAdmin() {
  const auth = await requireUser();
  if (!auth.user) {
    return { error: auth.error, status: auth.status, user: null };
  }
  if (!isAdmin(auth.user)) {
    return { error: "Forbidden" as const, status: 403 as const, user: null };
  }
  return { user: auth.user, error: null, status: null };
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = createHash("sha256")
    .update(salt + password)
    .digest("hex");
  return `${salt}:${hash}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const attempt = createHash("sha256")
    .update(salt + password)
    .digest("hex");
  try {
    return timingSafeEqual(Buffer.from(hash), Buffer.from(attempt));
  } catch {
    return false;
  }
}
