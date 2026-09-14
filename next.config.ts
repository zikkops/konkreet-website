import type { NextConfig } from "next";

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
};

export default nextConfig;
