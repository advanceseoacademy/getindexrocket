import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BreadcrumbJsonLd } from "@/components/marketing/BreadcrumbJsonLd";
import { FaqPageJsonLd } from "@/components/marketing/FaqPageJsonLd";
import { LandingPageTemplate } from "@/components/marketing/LandingPageTemplate";
import { LegalPageJsonLd } from "@/components/marketing/LegalPageJsonLd";
import { getLandingPage, LANDING_SLUGS } from "@/lib/landing-pages";
import { buildPageMetadata } from "@/lib/seo-metadata";

export const dynamic = "force-static";

export const dynamicParams = false;

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return LANDING_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getLandingPage(slug);
  if (!page) {
    return buildPageMetadata({
      title: "Page not found",
      description: "This page could not be found.",
      path: `/${slug}`,
      index: false,
    });
  }

  return buildPageMetadata({
    title: page.meta.title,
    description: page.meta.description,
    path: `/${page.slug}`,
    keywords: page.meta.keywords,
  });
}

export default async function KeywordLandingPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getLandingPage(slug);
  if (!page) notFound();

  const path = `/${page.slug}`;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: page.breadcrumbLabel, path },
        ]}
      />
      <LegalPageJsonLd
        path={path}
        name={page.meta.title}
        description={page.meta.description}
      />
      <FaqPageJsonLd items={page.faq} path={path} />
      <LandingPageTemplate page={page} />
    </>
  );
}
