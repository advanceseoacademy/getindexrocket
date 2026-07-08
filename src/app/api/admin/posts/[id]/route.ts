import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { serializeBlogPost, uniqueSlug } from "@/lib/blog";
import { prisma } from "@/lib/prisma";

function normalizeFeaturedImageUrl(value: string | null | undefined) {
  if (value === undefined) return undefined;
  const trimmed = value?.trim() ?? "";
  return trimmed || null;
}

type RouteContext = { params: Promise<{ id: string }> };

const featuredImageSchema = z
  .union([z.string().url().max(2048), z.string().regex(/^\/[a-zA-Z0-9/_.-]+$/, "Invalid image path"), z.literal("")])
  .optional()
  .nullable();

const updatePostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(160).optional(),
  excerpt: z.string().max(500).optional().nullable(),
  featuredImageUrl: featuredImageSchema,
  content: z.string().min(1).optional(),
  metaTitle: z.string().max(70).optional().nullable(),
  metaDescription: z.string().max(160).optional().nullable(),
  metaKeywords: z.string().max(500).optional().nullable(),
  status: z.enum(["draft", "published"]).optional(),
});

export async function GET(_request: NextRequest, context: RouteContext) {
  const auth = await requireAdmin();
  if (!auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status! });
  }

  const { id } = await context.params;
  const post = await prisma.blogPost.findUnique({
    where: { id },
    include: { author: { select: { name: true, email: true } } },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json({ post: serializeBlogPost(post) });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await requireAdmin();
  if (!auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status! });
  }

  const { id } = await context.params;
  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updatePostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const data = parsed.data;
  let slug = existing.slug;
  if (data.slug && data.slug !== existing.slug) {
    slug = await uniqueSlug(data.slug, id);
  } else if (data.title && !data.slug && data.title !== existing.title) {
    slug = await uniqueSlug(data.title, id);
  }

  let publishedAt = existing.publishedAt;
  if (data.status === "published" && existing.status !== "published") {
    publishedAt = new Date();
  } else if (data.status === "draft") {
    publishedAt = null;
  }

  const post = await prisma.blogPost.update({
    where: { id },
    data: {
      ...(data.title !== undefined ? { title: data.title.trim() } : {}),
      slug,
      ...(data.excerpt !== undefined ? { excerpt: data.excerpt?.trim() || null } : {}),
      ...(data.featuredImageUrl !== undefined
        ? { featuredImageUrl: normalizeFeaturedImageUrl(data.featuredImageUrl) }
        : {}),
      ...(data.content !== undefined ? { content: data.content } : {}),
      ...(data.metaTitle !== undefined ? { metaTitle: data.metaTitle?.trim() || null } : {}),
      ...(data.metaDescription !== undefined
        ? { metaDescription: data.metaDescription?.trim() || null }
        : {}),
      ...(data.metaKeywords !== undefined
        ? { metaKeywords: data.metaKeywords?.trim() || null }
        : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
      publishedAt,
    },
    include: { author: { select: { name: true, email: true } } },
  });

  return NextResponse.json({ post: serializeBlogPost(post) });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const auth = await requireAdmin();
  if (!auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status! });
  }

  const { id } = await context.params;
  const existing = await prisma.blogPost.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  await prisma.blogPost.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
