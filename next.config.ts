import type { NextConfig } from "next";

// Default: Vercel deployment with next/image optimization.
const nextConfig: NextConfig = {
  images: {
    // Next 16 requires every quality used by <Image quality> to be allowlisted.
    // 90 keeps the green glow gradients from banding.
    qualities: [90, 100],
  },

  // --- Pure static export (S3, Netlify, cPanel, ...) ---------------------
  // Uncomment the three lines below and run `npm run optimize-images` first,
  // because Next.js does not optimize images in export mode.
  // output: 'export',
  // images: { unoptimized: true },
  // trailingSlash: true,
};

export default nextConfig;
