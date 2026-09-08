import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "public.blob.vercel-storage.com",
      },
    ],
  },
  turbopack: {
    root: process.cwd(),
  },
  async redirects() {
    // Old apex Odoo paths previously indexed by Google.
    // Send them permanently to the marketing homepage so search results refresh.
    return [
      { source: "/web", destination: "/", permanent: true },
      { source: "/web/:path*", destination: "/", permanent: true },
      { source: "/odoo", destination: "/", permanent: true },
      { source: "/odoo/:path*", destination: "/", permanent: true },
      { source: "/web/login", destination: "/", permanent: true },
      {
        source: "/:locale(en|so)/web",
        destination: "/:locale",
        permanent: true,
      },
      {
        source: "/:locale(en|so)/web/:path*",
        destination: "/:locale",
        permanent: true,
      },
      {
        source: "/:locale(en|so)/odoo",
        destination: "/:locale",
        permanent: true,
      },
      {
        source: "/:locale(en|so)/odoo/:path*",
        destination: "/:locale",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
