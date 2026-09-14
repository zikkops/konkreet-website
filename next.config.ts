import type { NextConfig } from "next";

// Sent on every response. They cost nothing and close off the common
// browser-side attacks: MIME sniffing, clickjacking, referrer leakage and
// pages being served over plain http once a browser has seen https.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  images: {
    // AVIF first, WebP as the fallback: the optimizer re-encodes whatever the
    // source format is, so the JPEGs inherited from the old site are served
    // in a modern format without touching the files themselves.
    formats: ["image/avif", "image/webp"],
    // The photographs never change under the same filename, so cache the
    // optimized variants for a year instead of the 60s default.
    minimumCacheTTL: 31536000,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
