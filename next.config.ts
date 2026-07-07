import type { NextConfig } from "next";
import path from "path";

const indexNowKey = process.env.INDEXNOW_KEY?.trim();

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  turbopack: {
    root: path.join(__dirname),
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
    // Inline CSS in HTML to eliminate render-blocking stylesheet requests (Lighthouse).
    inlineCss: true,
    optimizePackageImports: ["@prisma/client"],
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
};

export default nextConfig;
