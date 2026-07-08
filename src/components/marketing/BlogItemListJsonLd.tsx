import { APP_NAME, APP_URL } from "@/lib/brand";

type BlogPost = {
  slug: string;
  title: string;
  publishedAt: Date | null;
};

export function BlogItemListJsonLd({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) return null;

  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${APP_NAME} Blog`,
    url: `${APP_URL}/blog`,
    itemListElement: posts.map((post, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${APP_URL}/blog/${post.slug}`,
      name: post.title,
    })),
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
