const axios = require('axios');

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.7teck.vn',
  generateRobotsTxt: true,
  sitemapSize: 5000,
  exclude: ['/cms/*'],
  robotsTxtOptions: {
    policies: [{ userAgent: '*', disallow: ['/cms/*'] }],
  },
  async transform(config, path) {
    return {
      loc: path,
      changefreq: 'daily',
      priority: 0.7,
      lastmod: new Date().toISOString(),
    };
  },
  async additionalPaths() {
    const paths = [];

    const slugify = (text) =>
      text
        .toString()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    const endpoints = [
      { path: 'dien-thoai', url: '/api/phones', nameField: 'name' },
      { path: 'may-tinh-bang', url: '/api/tablets', nameField: 'tablet_name' },
      { path: 'macbook', url: '/api/laptop-macbook', nameField: 'macbook_name' },
      { path: 'windows', url: '/api/laptop-windows', nameField: 'windows_name' },
    ];

    for (const endpoint of endpoints) {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint.url}`);
        const { success, data } = res.data;
        if (success) {
          const segmentPaths = data.map((item) => ({
            loc: `/${endpoint.path}/${slugify(item[endpoint.nameField])}/${item._id}`,
            changefreq: 'daily',
            priority: 0.7,
            lastmod: new Date().toISOString(),
          }));
          paths.push(...segmentPaths);
        }
      } catch (err) {
        console.error(`${endpoint.path} sitemap error:`, err.message);
      }
    }

    return paths;
  },
};
