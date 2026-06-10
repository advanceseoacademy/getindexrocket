import { NextResponse } from "next/server";
import { APP_SLUG } from "@/lib/brand";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      service: APP_SLUG,
      database: "connected",
    });
  } catch {
    return NextResponse.json(
      { status: "degraded", service: APP_SLUG, database: "disconnected" },
      { status: 503 },
    );
  }
}
