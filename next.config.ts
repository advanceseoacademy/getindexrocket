import type { NextConfig } from "next";
import path from "path";

const indexNowKey = process.env.INDEXNOW_KEY?.trim();

const LONG_CACHE = "public, max-age=31536000, immutable";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [32, 48, 64, 96, 128, 256],
  },
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: LONG_CACHE }],
      },
      {
        source: "/logo.png",
        headers: [{ key: "Cache-Control", value: LONG_CACHE }],
      },
      {
        source: "/icon.png",
        headers: [{ key: "Cache-Control", value: LONG_CACHE }],
      },
      {
        source: "/icon-:size.png",
        headers: [{ key: "Cache-Control", value: LONG_CACHE }],
      },
      {
        source: "/apple-icon.png",
        headers: [{ key: "Cache-Control", value: LONG_CACHE }],
      },
      {
        source: "/favicon.ico",
        headers: [{ key: "Cache-Control", value: LONG_CACHE }],
      },
    ];
  },
  async rewrites() {
    if (!indexNowKey || indexNowKey.length < 8) return [];
    return [
      {
        source: `/${indexNowKey}.txt`,
        destination: `/indexnow/${indexNowKey}.txt`,
      },
    ];
  },
  experimental: {
    inlineCss: true,
    optimizePackageImports: ["@prisma/client"],
    staleTimes: {
      dynamic: 60,
      static: 600,
    },
  },
};

export default nextConfig;
