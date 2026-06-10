import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { serializeTask } from "@/lib/tasks-serialize";
import { syncTaskFromProvider } from "@/lib/sync-task";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireUser();
  if (!auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status! });
  }

  const { id } = await params;

  try {
    const updated = await syncTaskFromProvider(id, auth.user.id);
    if (!updated) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json({ task: serializeTask(updated) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Status update failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
