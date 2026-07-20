import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { isDisposableEmail } from "@/lib/disposable-email";
import { prisma } from "@/lib/prisma";

export const DEVICE_COOKIE = "gir_device";
const DEVICE_COOKIE_DAYS = 400;
const IP_SIGNUP_COOLDOWN_DAYS = 30;

function getHashSecret() {
  return (
    process.env.SESSION_SECRET ??
    process.env.BMC_WEBHOOK_SECRET ??
    "dev-insecure-session-secret"
  );
}

export function hashDeviceId(deviceId: string) {
  return createHash("sha256")
    .update(`${getHashSecret()}:device:${deviceId}`)
    .digest("hex");
}

export function hashIp(ip: string) {
  return createHash("sha256")
    .update(`${getHashSecret()}:ip:${ip}`)
    .digest("hex");
}

export function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  return realIp || null;
}

function normalizeDeviceId(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const cleaned = raw.trim().slice(0, 128);
  if (cleaned.length < 8) return null;
  return cleaned;
}

export async function resolveDeviceId(
  request: Request,
  clientDeviceId?: string | null,
): Promise<string> {
  const cookieStore = await cookies();
  const fromCookie = normalizeDeviceId(cookieStore.get(DEVICE_COOKIE)?.value);
  if (fromCookie) return fromCookie;

  const fromClient = normalizeDeviceId(clientDeviceId);
  if (fromClient) return fromClient;

  return randomBytes(24).toString("hex");
}

export async function setDeviceCookie(deviceId: string) {
  const cookieStore = await cookies();
  cookieStore.set(DEVICE_COOKIE, deviceId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DEVICE_COOKIE_DAYS * 24 * 60 * 60,
  });
}

export type SignupGuardOk = {
  ok: true;
  deviceId: string;
  deviceHash: string;
  ipHash: string | null;
};

export type SignupGuardFail = {
  ok: false;
  error: string;
  status: number;
};

/** Block disposable email + one account per PC/device (+ IP cooldown). */
export async function assertCanCreateAccount(opts: {
  request: Request;
  email: string;
  deviceId?: string | null;
}): Promise<SignupGuardOk | SignupGuardFail> {
  const email = opts.email.toLowerCase().trim();

  if (isDisposableEmail(email)) {
    return {
      ok: false,
      status: 400,
      error:
        "Temporary or disposable email addresses are not allowed. Please use a permanent email.",
    };
  }

  const deviceId = await resolveDeviceId(opts.request, opts.deviceId);
  const deviceHash = hashDeviceId(deviceId);
  const ip = getClientIp(opts.request);
  const ipHash = ip ? hashIp(ip) : null;

  const existingDevice = await prisma.signupDevice.findUnique({
    where: { deviceHash },
    select: { id: true },
  });
  if (existingDevice) {
    return {
      ok: false,
      status: 403,
      error:
        "An account was already created on this device. Please sign in instead.",
    };
  }

  if (ipHash) {
    const since = new Date();
    since.setDate(since.getDate() - IP_SIGNUP_COOLDOWN_DAYS);
    const recentIp = await prisma.signupDevice.findFirst({
      where: { ipHash, createdAt: { gte: since } },
      select: { id: true },
    });
    if (recentIp) {
      return {
        ok: false,
        status: 403,
        error:
          "An account was recently created from this network. Please sign in or try again later.",
      };
    }
  }

  return { ok: true, deviceId, deviceHash, ipHash };
}

export async function recordSignupDevice(opts: {
  userId: string;
  deviceId: string;
  deviceHash: string;
  ipHash: string | null;
}) {
  await prisma.signupDevice.create({
    data: {
      userId: opts.userId,
      deviceHash: opts.deviceHash,
      ipHash: opts.ipHash,
    },
  });
  await setDeviceCookie(opts.deviceId);
}
