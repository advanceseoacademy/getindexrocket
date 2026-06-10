import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  turbopack: {
    root: path.join(__dirname),
  },
  experimental: {
    optimizePackageImports: ["@prisma/client"],
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
};

export default nextConfig;
