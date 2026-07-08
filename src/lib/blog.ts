import { prisma } from "@/lib/prisma";
import { APP_URL } from "@/lib/brand";

export type BlogPostStatus = "draft" | "published";

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const slug = slugifyTitle(base) || "post";
  let suffix = 0;

  while (true) {
    const candidate = suffix === 0 ? slug : `${slug}-${suffix}`;
    const existing = await prisma.blogPost.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) return candidate;
    suffix += 1;
  }
}

export function parseMetaKeywords(raw: string | null | undefined): string[] | undefined {
  if (!raw?.trim()) return undefined;
  const keywords = raw
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  return keywords.length ? keywords : undefined;
}

export function resolveBlogImageUrl(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/")) return `${APP_URL}${trimmed}`;
  return `${APP_URL}/${trimmed}`;
}

export function serializeBlogPost(post: {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  featuredImageUrl?: string | null;
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  status: string;
  publishedAt: Date | null;
  authorId: string | null;
  createdAt: Date;
  updatedAt: Date;
  author?: { name: string | null; email: string } | null;
}) {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    featuredImageUrl: post.featuredImageUrl ?? null,
    content: post.content,
    metaTitle: post.metaTitle,
    metaDescription: post.metaDescription,
    metaKeywords: post.metaKeywords,
    status: post.status,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    authorId: post.authorId,
    authorName: post.author?.name ?? post.author?.email ?? null,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}

export async function getPublishedPosts(limit?: number) {
  try {
    return await prisma.blogPost.findMany({
      where: { status: "published" },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        featuredImageUrl: true,
        metaDescription: true,
        publishedAt: true,
        updatedAt: true,
        author: { select: { name: true, email: true } },
      },
    });
  } catch (error) {
    if (isMissingBlogTable(error)) return [];
    throw error;
  }
}

export async function getPublishedPostBySlug(slug: string) {
  try {
    return await prisma.blogPost.findFirst({
      where: { slug, status: "published" },
      include: {
        author: { select: { name: true, email: true } },
      },
    });
  } catch (error) {
    if (isMissingBlogTable(error)) return null;
    throw error;
  }
}

function isMissingBlogTable(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "P2021"
  );
}
