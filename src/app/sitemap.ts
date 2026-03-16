import { MetadataRoute } from 'next';
import axios, { AxiosResponse } from 'axios';
import { log } from 'console';
import { encodeObjectId } from '@/utils/DetailPage/objectIdCodec';

// Interface cho các mục trong phản hồi API
interface Item {
  _id: string;
  name?: string;
  tablet_slug?: string;
  macbook_slug?: string;
  windows_slug?: string;
  updatedAt?: string;
  [key: string]: string | undefined; // Index signature để cho phép truy cập động
}

// Interface cho phản hồi API
interface ApiResponse {
  success?: boolean;
  message?: string;
  count?: number;
  data?: Item[];
  phones?: Item[];
  tablets?: Item[];
  macbook?: Item[];
  windows?: Item[];
  [key: string]: Item[] | boolean | string | number | undefined; // Index signature cho ApiResponse
}

const domain = 'https://www.7teck.vn';

// Hàm lấy dữ liệu từ API
async function getDynamicPaths(): Promise<MetadataRoute.Sitemap> {
  const paths: MetadataRoute.Sitemap = [];
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.7teck.vn';
  // console.log('API Base URL:', baseUrl); // Debug

  const endpoints = [
    { path: 'dien-thoai', url: '/api/phones', slugField: 'name', dataField: 'phones', includeIdInUrl: true },
    { path: 'may-tinh-bang', url: '/api/tablets', slugField: 'tablet_slug', dataField: 'tablets', includeIdInUrl: true },
    { path: 'macbook', url: '/api/laptop-macbook', slugField: 'macbook_slug', dataField: 'macbook', includeIdInUrl: true },
    { path: 'windows', url: '/api/laptop-windows', slugField: 'windows_slug', dataField: 'windows', includeIdInUrl: true },
    { path: 'tin-tuc', url: '/api/posts', slugField: 'title', dataField: 'posts', includeIdInUrl: true },
    //
    { path: 'dien-thoai', url: '/api/phone-catalogs', slugField: 'name', dataField: 'phoneCatalogs', includeIdInUrl: false },
    { path: 'may-tinh-bang', url: '/api/tablet-catalogs', slugField: 't_cat_slug', dataField: 'tabletCatalogs', includeIdInUrl: false },
    { path: 'macbook', url: '/api/macbook-catalogs', slugField: 'm_cat_slug', dataField: 'macbookCatalogs', includeIdInUrl: false },
    { path: 'windows', url: '/api/windows-catalogs', slugField: 'w_cat_slug', dataField: 'windowsCatalogs', includeIdInUrl: false },
  ];

  for (const endpoint of endpoints) {
    try {
      // console.log(`Fetching API: ${baseUrl}${endpoint.url} ✓`); // Debug
      const res: AxiosResponse<ApiResponse> = await axios.get<ApiResponse>(`${baseUrl}${endpoint.url}`);
      // console.log(`API Response for ${endpoint.path}:`, res.data); // Debug

      let data: Item[] = [];
      if ('success' in res.data && Array.isArray(res.data.data)) {
        data = res.data.data;
      } else if (endpoint.dataField in res.data && Array.isArray(res.data[endpoint.dataField])) {
        data = res.data[endpoint.dataField] as Item[];
      }

      if (data.length > 0) {
        const segmentPaths = data.flatMap((item: Item) => {
          const slug = item[endpoint.slugField] || '';
          const lastModified = item.updatedAt ? new Date(item.updatedAt) : new Date();

          const baseEntry = (url: string): MetadataRoute.Sitemap[number] => ({
            url,
            lastModified,
            changeFrequency: 'daily',
            priority: 0.7,
          });

          // raw & encoded id
          const rawId = item._id;
          const encodedId = encodeObjectId(rawId);

          // URL chính: /path/slug/id (CANONICAL)
          const mainUrl = `${domain}/${endpoint.path}/${slug}/${rawId}`;

          // URL base/name: /path/slug
          const nameOnlyUrl = `${domain}/${endpoint.path}/${slug}`;

          // URL name/id: /slug/id
          const nameIdUrl = `${domain}/${slug}/${rawId}`;

          // ====== MỞ RỘNG BIẾN THỂ SEO ======

          // /slug/encodedId
          const nameEncodedIdUrl = `${domain}/${slug}/${encodedId}`;

          // /slug-id
          const slugRawIdUrl = `${domain}/${slug}-${rawId}`;

          // /slug-encodedId
          const slugEncodedIdUrl = `${domain}/${slug}-${encodedId}`;

          return [
            baseEntry(mainUrl), // canonical
            baseEntry(nameOnlyUrl), // slug
            baseEntry(nameIdUrl), // slug/id (raw)
            baseEntry(nameEncodedIdUrl), // slug/encodedId
            baseEntry(slugRawIdUrl), // slug-id
            baseEntry(slugEncodedIdUrl), // slug-encodedId
          ];
        });

        paths.push(...segmentPaths);
      } else {
        console.log(`No valid data for ${endpoint.path}`); // Debug
      }
    } catch (err) {
      console.error(`Error fetching ${endpoint.path}:`, (err as Error).message); // Debug
    }
  }

  // console.log('Dynamic Paths:', paths); // Debug
  return paths;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${domain}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${domain}/dien-thoai`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${domain}/may-tinh-bang`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${domain}/macbook`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${domain}/windows`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${domain}/bang-gia-thu-mua`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${domain}/thanh-toan`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${domain}/thu-thuat-va-meo-hay`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${domain}/tin-tuc-moi-nhat`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${domain}/thiet-bi-da-qua-su-dung`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${domain}/chinh-sach-quyen-rieng-tu`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${domain}/dieu-khoan-dich-vu`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${domain}/chinh-sach-bao-hanh`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${domain}/hanh-trinh-khach-hang`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
  ];

  const dynamicPages = await getDynamicPaths();
  log('____Static Pages Count:', staticPages.length); // Debug
  log('____Dynamic Pages Count:', dynamicPages.length); // Debug
  console.log('____Total Pages:', [...staticPages, ...dynamicPages].length); // Debug

  const allPages = [...staticPages, ...dynamicPages].filter((page) => !page.url.includes('/cms/'));

  return allPages.slice(0, 5000);
}
