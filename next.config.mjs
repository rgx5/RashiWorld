/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Product media comes from Supabase storage + external CDNs.
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'cdn-icons-png.flaticon.com' },
    ],
    // Serve AVIF when the browser supports it (smaller than WebP), else WebP.
    // Next re-encodes + resizes per-device on request and caches the result,
    // so every <Image> below gets a right-sized, modern-format response
    // regardless of what was originally uploaded.
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
};

export default nextConfig;
