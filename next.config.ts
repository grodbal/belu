import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: 4 * 1024 * 1024,
    },
  },
};

export default nextConfig;
