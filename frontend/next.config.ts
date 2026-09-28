import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Self-contained server bundle for the Docker image
  output: "standalone",
  // 95 keeps the fine lettering in the SOU seal crisp
  images: { qualities: [75, 95] },
};

export default nextConfig;
