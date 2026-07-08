import Link from "next/link";
import Image from "next/image";
import { BreadcrumbJsonLd } from "@/components/marketing/BreadcrumbJsonLd";
import { BlogItemListJsonLd } from "@/components/marketing/BlogItemListJsonLd";
import { VisibleBreadcrumbs } from "@/components/marketing/VisibleBreadcrumbs";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { APP_NAME } from "@/lib/brand";
import { getPublishedPosts } from "@/lib/blog";
import { buildPageMetadata } from "@/lib/seo-metadata";

export const revalidate = 3600;

export const metadata = buildPageMetadata({
  title: "Blog — SEO & Backlink Indexing Guides",
  description: `Read ${APP_NAME} blog posts on backlink indexing, Google discovery, guest post SEO, and URL submission best practices.`,
  path: "/blog",
  keywords: [
    "backlink indexing blog",
    "seo indexing guides",
    "google indexing tips",
    "guest post indexing",
    "url indexing",
  ],
});

function formatBlogDate(iso: string | Date | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts();

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
        ]}
      />
      <BlogItemListJsonLd
        posts={posts.map((p) => ({ slug: p.slug, title: p.title, publishedAt: p.publishedAt }))}
      />
      <section className="site-container py-16">
        <VisibleBreadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
          ]}
        />
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-[var(--accent)]">Blog</p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">SEO &amp; indexing insights</h1>
          <p className="mt-4 text-[var(--muted)]">
            Guides on backlink indexing, URL discovery, and honest SEO workflows for guest posts and
            third-party links.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-10 text-center">
            <p className="text-[var(--muted)]">No posts published yet. Explore our guides in the meantime.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/how-it-works" variant="ghost">
                How it works
              </ButtonLink>
              <ButtonLink href="/faq" variant="ghost">
                FAQ
              </ButtonLink>
              <ButtonLink href="/register">Create account</ButtonLink>
            </div>
          </div>
        ) : (
          <div className="mt-12 grid gap-6">
            {posts.map((post) => (
              <article
                key={post.id}
                className="hover-lift overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card)]"
              >
                {post.featuredImageUrl ? (
                  <Link href={`/blog/${post.slug}`} className="block no-underline">
                    <div className="relative aspect-[1200/630] w-full">
                      <Image
                        src={post.featuredImageUrl}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 768px"
                        unoptimized={post.featuredImageUrl.startsWith("http")}
                      />
                    </div>
                  </Link>
                ) : null}
                <div className="p-6">
                <time
                  dateTime={post.publishedAt?.toISOString()}
                  className="text-xs text-[var(--muted2)]"
                >
                  {formatBlogDate(post.publishedAt)}
                </time>
                <h2 className="mt-2 text-xl font-semibold">
                  <Link href={`/blog/${post.slug}`} className="no-underline hover:text-[var(--accent)]">
                    {post.title}
                  </Link>
                </h2>
                {(post.excerpt || post.metaDescription) && (
                  <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                    {post.excerpt || post.metaDescription}
                  </p>
                )}
                <Link
                  href={`/blog/${post.slug}`}
                  className="mt-4 inline-flex text-sm font-medium text-[var(--blue)] no-underline hover:underline"
                >
                  Read more →
                </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
