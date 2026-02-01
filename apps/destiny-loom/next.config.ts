import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  transpilePackages: ["@cyberfaith/ui", "@cyberfaith/utils", "@cyberfaith/auth-client", "@cyberfaith/ai-provider"],
};

export default withNextIntl(nextConfig);
