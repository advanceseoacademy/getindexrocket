import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getAccountBalance } from "@/lib/indexnowfast";

export async function GET() {
  const auth = await requireUser();
  if (!auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status! });
  }

  try {
    const account = await getAccountBalance();
    return NextResponse.json({ credit_balance: account.credit_balance });
  } catch {
    return NextResponse.json({ error: "Provider unavailable" }, { status: 502 });
  }
}
