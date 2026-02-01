import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  transpilePackages: ["@cyberfaith/ui", "@cyberfaith/utils"],
};

export default nextConfig;
