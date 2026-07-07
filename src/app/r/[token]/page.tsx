import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRequestUserAgent, recordBotHit } from "@/lib/indexer/hub";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  const row = await prisma.taskUrl.findUnique({
    where: { hubToken: token },
    select: { url: true },
  });

  return {
    title: row ? "Resource link" : "Link not found",
    robots: { index: false, follow: true },
  };
}

export default async function HubPage({ params }: PageProps) {
  const { token } = await params;
  const row = await prisma.taskUrl.findUnique({
    where: { hubToken: token },
    select: { url: true, status: true },
  });

  if (!row) notFound();

  const userAgent = await getRequestUserAgent();
  await recordBotHit(token, userAgent);

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-16">
      <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Indexed resource</p>
      <h1 className="mt-2 text-lg font-semibold text-[var(--text)]">Referenced URL</h1>
      <p className="mt-3 break-all text-sm text-[var(--muted)]">{row.url}</p>
      <a
        href={row.url}
        rel="noopener noreferrer"
        className="mt-6 inline-flex w-fit items-center rounded-lg bg-[var(--green)] px-4 py-2 text-sm font-medium text-black no-underline hover:opacity-90"
      >
        Visit URL
      </a>
      <p className="mt-8 text-xs text-[var(--muted)]">
        Discovery hub — helps search engines find the referenced page.
      </p>
    </main>
  );
}
