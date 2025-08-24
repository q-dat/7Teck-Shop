import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false, // false → build production sẽ không tạo source map → file nhẹ hơn, deploy nhanh hơn, kẻ khác cũng khó “đọc” code của bạn hơn.
  // Cấu hình Webpack cho dev
  webpack(config, { dev }) {
    if (dev) {
      config.devtool = false;
    }
    return config;
  },
  // Cấu hình cho Next.js
  devIndicators: false,
  images: {
    // unoptimized: true, // true: dev mode, false: prod mode
    formats: ['image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        // hostname: 'res.cloudinary.com',
        hostname: '**', // Cho phép tất cả hostname
        pathname: '/**',
      },
    ],
  },
  // async headers() {
  //   return [
  //     {
  //       source: '/(.*)', // Áp dụng cho toàn bộ route
  //       headers: [
  //         {
  //           key: 'Strict-Transport-Security',
  //           value: 'max-age=63072000; includeSubDomains; preload',
  //         },
  //         {
  //           key: 'X-Frame-Options',
  //           value: 'DENY',
  //         },
  //         {
  //           key: 'X-Content-Type-Options',
  //           value: 'nosniff',
  //         },
  //         {
  //           key: 'Referrer-Policy',
  //           value: 'strict-origin-when-cross-origin',
  //         },
  //         {
  //           key: 'Permissions-Policy',
  //           value: 'geolocation=(), microphone=(), camera=()',
  //         },
  //         {
  //           key: 'X-DNS-Prefetch-Control',
  //           value: 'on',
  //         },
  //         {
  //           key: 'Cross-Origin-Embedder-Policy',
  //           value: 'require-corp',
  //         },
  //         {
  //           key: 'Cross-Origin-Opener-Policy',
  //           value: 'same-origin',
  //         },
  //         {
  //           key: 'Cross-Origin-Resource-Policy',
  //           value: 'same-origin',
  //         },
  //       ],
  //     },
  //   ];
  // },
};

export default nextConfig;
