import { requireUser } from "@/lib/auth";
import { APP_SLUG } from "@/lib/brand";
import { displayStatus } from "@/lib/indexing-status";
import { prisma } from "@/lib/prisma";

function csvEscape(value: string) {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  const auth = await requireUser();
  if (!auth.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const tasks = await prisma.task.findMany({
    where: { userId: auth.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { urls: true },
  });

  const header = "URL,Status,Indexed At,Submitted At,Task ID,Credits";
  const rows: string[] = [header];

  for (const task of tasks) {
    for (const url of task.urls) {
      rows.push(
        [
          csvEscape(url.url),
          csvEscape(displayStatus(url.status)),
          csvEscape(url.indexedAt?.toISOString() ?? ""),
          csvEscape(task.createdAt.toISOString()),
          csvEscape(task.id),
          String(task.creditsCharged),
        ].join(","),
      );
    }
  }

  const body = rows.join("\n");
  const filename = `${APP_SLUG}-report-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
