import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? "/supernote-templates" : "",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  reactCompiler: true,
};

export default withNextIntl(nextConfig);
