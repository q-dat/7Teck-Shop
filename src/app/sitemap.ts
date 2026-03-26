import { MetadataRoute } from 'next';
import axios, { AxiosResponse } from 'axios';

interface Item {
  _id: string;
  slug?: string;
  tablet_slug?: string;
  macbook_slug?: string;
  windows_slug?: string;
  updatedAt?: string;
  [key: string]: string | undefined;
}

interface ApiResponse {
  data?: Item[];
  phones?: Item[];
  tablets?: Item[];
  macbook?: Item[];
  windows?: Item[];
  [key: string]: any;
}

const domain = 'https://www.7teck.vn';

const buildEntry = (url: string, lastModified: Date): MetadataRoute.Sitemap[number] => ({
  url,
  lastModified,
  changeFrequency: 'daily',
  priority: 0.7,
});

async function getDynamicPaths(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL as string;
  const paths: MetadataRoute.Sitemap = [];

  const endpoints = [
    { url: '/api/phones', slugField: 'slug', dataField: 'phones' },
    { url: '/api/tablets', slugField: 'tablet_slug', dataField: 'tablets' },
    { url: '/api/laptop-macbook', slugField: 'macbook_slug', dataField: 'macbook' },
    { url: '/api/laptop-windows', slugField: 'windows_slug', dataField: 'windows' },
    { url: '/api/posts', slugField: 'title', dataField: 'posts', prefix: 'tin-tuc' },
  ];

  for (const ep of endpoints) {
    try {
      const res: AxiosResponse<ApiResponse> = await axios.get(`${baseUrl}${ep.url}`);

      const data: Item[] = Array.isArray(res.data.data)
        ? res.data.data
        : Array.isArray(res.data[ep.dataField])
          ? (res.data[ep.dataField] as Item[])
          : [];

      if (!data.length) continue;

      const segmentPaths = data
        .map((item) => {
          const slug = item[ep.slugField];
          if (!slug) return null;

          const lastModified = item.updatedAt ? new Date(item.updatedAt) : new Date();

          const url = ep.prefix ? `${domain}/${ep.prefix}/${slug}` : `${domain}/${slug}`;

          return buildEntry(url, lastModified);
        })
        .filter(Boolean) as MetadataRoute.Sitemap;

      paths.push(...segmentPaths);
    } catch (err) {
      console.error(`Error fetching ${ep.url}:`, (err as Error).message);
    }
  }

  return paths;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    '',
    '/dien-thoai',
    '/may-tinh-bang',
    '/macbook',
    '/windows',
    '/bang-gia-thu-mua',
    '/thanh-toan',
    '/thu-thuat-va-meo-hay',
    '/tin-tuc-moi-nhat',
    '/thiet-bi-da-qua-su-dung',
    '/chinh-sach-quyen-rieng-tu',
    '/dieu-khoan-dich-vu',
    '/chinh-sach-bao-hanh',
    '/hanh-trinh-khach-hang',
  ].map((path) => buildEntry(`${domain}${path}`, now));

  const dynamicPages = await getDynamicPaths();

  const allPages = [...staticPages, ...dynamicPages].filter((p) => !p.url.includes('/cms/'));

  return allPages.slice(0, 5000);
}
