import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@cyberfaith/ui", "@cyberfaith/utils", "@cyberfaith/auth-client"],
};

export default nextConfig;
