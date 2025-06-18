import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/cms/*'],
      },
    ],
    sitemap: 'https://www.7teck.vn/sitemap.xml',
  };
}