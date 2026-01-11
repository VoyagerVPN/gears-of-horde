import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  images: {
    // Skip optimization in development to avoid timeout issues with remote images
    unoptimized: isDev,

    // Cost optimization: Cache images for 31 days (user uploads rarely change)
    minimumCacheTTL: 2678400,

    // Cost optimization: Use WebP only (not both WebP and AVIF) to reduce transformations
    formats: ['image/webp'],

    // Cost optimization: Limit device sizes to reduce transformation variations
    deviceSizes: [640, 1080, 1920],

    // Cost optimization: Limit image sizes for thumbnails
    imageSizes: [256, 384],

    // Allowed remote image sources
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'kajgltp6jtmm7ijy.public.blob.vercel-storage.com',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; img-src 'self' https: data:; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self' https: wss:;",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
