import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/cms/*', // chặn admin/cms nội bộ
          '/assets/', // chặn thư mục chứa JS tĩnh (nếu có)
          '/*.js$', // chặn file .js
          '/*.css$', // chặn file .css
          '/*.map$', // chặn source map (nếu public)
          '/_next/static/', // chặn static assets nội bộ của Next (không ảnh hưởng SEO)
          '/*?_rsc=', // ❗ chặn mọi URL chứa query `_rsc=...`
        ],
      },
    ],
    sitemap: 'https://www.7teck.vn/sitemap.xml',
  };
}
