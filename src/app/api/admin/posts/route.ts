import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { serializeBlogPost, uniqueSlug } from "@/lib/blog";
import { prisma } from "@/lib/prisma";

const postFields = {
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(160).optional(),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
  metaKeywords: z.string().max(500).optional(),
  status: z.enum(["draft", "published"]).optional(),
};

const createPostSchema = z.object(postFields);

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status! });
  }

  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const status = request.nextUrl.searchParams.get("status")?.trim() ?? "";
  const page = Math.max(1, Number(request.nextUrl.searchParams.get("page") ?? 1));
  const limit = Math.min(50, Math.max(10, Number(request.nextUrl.searchParams.get("limit") ?? 20)));
  const skip = (page - 1) * limit;

  const where = {
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { slug: { contains: q, mode: "insensitive" as const } },
            { excerpt: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
      include: { author: { select: { name: true, email: true } } },
    }),
    prisma.blogPost.count({ where }),
  ]);

  return NextResponse.json({
    posts: posts.map(serializeBlogPost),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status! });
  }

  const body = await request.json().catch(() => null);
  const parsed = createPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const data = parsed.data;
  const slug = data.slug ? await uniqueSlug(data.slug) : await uniqueSlug(data.title);
  const status = data.status ?? "draft";
  const publishedAt = status === "published" ? new Date() : null;

  const post = await prisma.blogPost.create({
    data: {
      title: data.title.trim(),
      slug,
      excerpt: data.excerpt?.trim() || null,
      content: data.content,
      metaTitle: data.metaTitle?.trim() || null,
      metaDescription: data.metaDescription?.trim() || null,
      metaKeywords: data.metaKeywords?.trim() || null,
      status,
      publishedAt,
      authorId: auth.user.id,
    },
    include: { author: { select: { name: true, email: true } } },
  });

  return NextResponse.json({ post: serializeBlogPost(post) }, { status: 201 });
}
