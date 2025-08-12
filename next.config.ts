import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        canvas: "canvas",
      });
    }
    return config;
  },
};

export default nextConfig;
