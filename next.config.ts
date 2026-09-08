import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "object-src 'none'",
      "img-src 'self' data: blob: https:",
      "media-src 'self' https:",
      "font-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "connect-src 'self' https:",
      "frame-src 'self' https://www.youtube.com https://youtube.com",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

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
      {
        protocol: "https",
        hostname: "*.blob.vercel-storage.com",
      },
    ],
  },
  turbopack: {
    root: process.cwd(),
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
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
