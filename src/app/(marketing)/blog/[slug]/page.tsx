import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleJsonLd } from "@/components/marketing/ArticleJsonLd";
import { BlogContent } from "@/components/marketing/BlogContent";
import { BreadcrumbJsonLd } from "@/components/marketing/BreadcrumbJsonLd";
import { APP_NAME } from "@/lib/brand";
import { getPublishedPostBySlug, parseMetaKeywords, resolveBlogImageUrl } from "@/lib/blog";
import { buildPageMetadata } from "@/lib/seo-metadata";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;
export const dynamicParams = true;

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: "published" },
      select: { slug: true },
    });
    return posts.map((post) => ({ slug: post.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) {
    return buildPageMetadata({
      title: "Post not found",
      description: "This blog post could not be found.",
      path: `/blog/${slug}`,
      index: false,
    });
  }

  const title = post.metaTitle?.trim() || post.title;
  const description =
    post.metaDescription?.trim() ||
    post.excerpt?.trim() ||
    `${post.title} — ${APP_NAME} blog on backlink indexing and SEO.`;

  const metadata = buildPageMetadata({
    title,
    description,
    path: `/blog/${post.slug}`,
    keywords: parseMetaKeywords(post.metaKeywords),
  });

  const featuredImage = resolveBlogImageUrl(post.featuredImageUrl);

  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      ...(featuredImage
        ? {
            images: [{ url: featuredImage, width: 1200, height: 630, alt: post.title }],
          }
        : {}),
    },
    ...(featuredImage
      ? {
          twitter: {
            ...metadata.twitter,
            images: [featuredImage],
          },
        }
      : {}),
  };
}

function formatBlogDate(iso: Date | null) {
  if (!iso) return "";
  return iso.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const description =
    post.metaDescription?.trim() ||
    post.excerpt?.trim() ||
    `${post.title} — ${APP_NAME} blog on backlink indexing and SEO.`;
  const authorName = post.author?.name ?? post.author?.email ?? APP_NAME;
  const publishedAt = post.publishedAt ?? post.createdAt;
  const featuredImage = post.featuredImageUrl;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ]}
      />
      <ArticleJsonLd
        title={post.title}
        description={description}
        slug={post.slug}
        publishedAt={publishedAt.toISOString()}
        updatedAt={post.updatedAt.toISOString()}
        authorName={authorName}
        imageUrl={resolveBlogImageUrl(post.featuredImageUrl) ?? undefined}
      />
      <article className="site-container py-16">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/blog"
            className="text-sm text-[var(--muted)] no-underline hover:text-[var(--text)]"
          >
            ← Back to blog
          </Link>
          <header className="mt-6 border-b border-[var(--card-border)] pb-8">
            <time dateTime={publishedAt.toISOString()} className="text-xs text-[var(--muted2)]">
              {formatBlogDate(publishedAt)}
            </time>
            <h1 className="mt-3 text-3xl font-bold leading-tight md:text-4xl">{post.title}</h1>
            {post.excerpt ? (
              <p className="mt-4 text-base leading-relaxed text-[var(--muted)]">{post.excerpt}</p>
            ) : null}
            <p className="mt-4 text-xs text-[var(--muted2)]">By {authorName}</p>
          </header>
          {featuredImage ? (
            <div className="relative mt-8 aspect-[1200/630] overflow-hidden rounded-2xl border border-[var(--card-border)]">
              <Image
                src={featuredImage}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
                priority
                unoptimized={featuredImage.startsWith("http")}
              />
            </div>
          ) : null}
          <div className="mt-8">
            <BlogContent content={post.content} />
          </div>
        </div>
      </article>
    </>
  );
}
