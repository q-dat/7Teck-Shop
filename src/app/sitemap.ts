import { MetadataRoute } from 'next';
import axios, { AxiosResponse } from 'axios';
import { encodeObjectId } from '@/utils/DetailPage/objectIdCodec';

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
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.7teck.vn';
  const paths: MetadataRoute.Sitemap = [];

  const endpoints = [
    { path: 'dien-thoai', url: '/api/phones', slugField: 'slug', dataField: 'phones', includeId: true },
    { path: 'may-tinh-bang', url: '/api/tablets', slugField: 'tablet_slug', dataField: 'tablets', includeId: true },
    { path: 'macbook', url: '/api/laptop-macbook', slugField: 'macbook_slug', dataField: 'macbook', includeId: true },
    { path: 'windows', url: '/api/laptop-windows', slugField: 'windows_slug', dataField: 'windows', includeId: true },
    { path: 'tin-tuc', url: '/api/posts', slugField: 'title', dataField: 'posts', includeId: true },

    { path: 'dien-thoai', url: '/api/phone-catalogs', slugField: 'slug', dataField: 'phoneCatalogs', includeId: false },
    { path: 'may-tinh-bang', url: '/api/tablet-catalogs', slugField: 't_cat_slug', dataField: 'tabletCatalogs', includeId: false },
    { path: 'macbook', url: '/api/macbook-catalogs', slugField: 'm_cat_slug', dataField: 'macbookCatalogs', includeId: false },
    { path: 'windows', url: '/api/windows-catalogs', slugField: 'w_cat_slug', dataField: 'windowsCatalogs', includeId: false },
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

      const segmentPaths = data.flatMap((item) => {
        const slug = item[ep.slugField] || '';
        if (!slug) return [];

        const lastModified = item.updatedAt ? new Date(item.updatedAt) : new Date();
        const rawId = item._id;
        const encodedId = encodeObjectId(rawId);

        // ===== URLS =====
        const canonical = `${domain}/${ep.path}/${slug}/${rawId}`;
        const slugOnly = `${domain}/${ep.path}/${slug}`;

        if (!ep.includeId) {
          return [buildEntry(slugOnly, lastModified)];
        }

        const slugIdPath = `${domain}/${slug}/${rawId}`;
        const slugIdInline = `${domain}/${slug}-${rawId}`;
        const slugEncodedPath = `${domain}/${slug}/${encodedId}`;
        const slugEncodedInline = `${domain}/${slug}-${encodedId}`;

        return [
          buildEntry(canonical, lastModified),
          buildEntry(slugOnly, lastModified),
          buildEntry(slugIdPath, lastModified),
          buildEntry(slugIdInline, lastModified),
          buildEntry(slugEncodedPath, lastModified),
          buildEntry(slugEncodedInline, lastModified),
        ];
      });

      paths.push(...segmentPaths);
    } catch (err) {
      console.error(`Error fetching ${ep.path}:`, (err as Error).message);
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
