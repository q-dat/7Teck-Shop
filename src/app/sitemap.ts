import { MetadataRoute } from 'next';
import axios, { AxiosResponse } from 'axios';

// Interface cho các mục trong phản hồi API
interface Item {
  _id: string;
  name?: string;
  tablet_name?: string;
  macbook_name?: string;
  windows_name?: string;
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

// Hàm slugify để tạo URL thân thiện
const slugify = (text: string): string =>
  text
    .toString()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// Hàm lấy dữ liệu từ API
async function getDynamicPaths(): Promise<MetadataRoute.Sitemap> {
  const paths: MetadataRoute.Sitemap = [];
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.7teck.vn';
  console.log('API Base URL:', baseUrl); // Debug

  const endpoints = [
    { path: 'dien-thoai', url: '/api/phones', nameField: 'name', dataField: 'phones', includeIdInUrl: true },
    { path: 'may-tinh-bang', url: '/api/tablets', nameField: 'tablet_name', dataField: 'tablets', includeIdInUrl: true },
    { path: 'macbook', url: '/api/laptop-macbook', nameField: 'macbook_name', dataField: 'macbook', includeIdInUrl: true },
    { path: 'windows', url: '/api/laptop-windows', nameField: 'windows_name', dataField: 'windows', includeIdInUrl: true },
    { path: 'tin-tuc', url: '/api/posts', nameField: 'title', dataField: 'posts', includeIdInUrl: true },
    //
    { path: 'dien-thoai', url: '/api/phone-catalogs', nameField: 'name', dataField: 'phoneCatalogs', includeIdInUrl: false },
    { path: 'may-tinh-bang', url: '/api/tablet-catalogs', nameField: 't_cat_name', dataField: 'tabletCatalogs', includeIdInUrl: false },
    { path: 'macbook', url: '/api/macbook-catalogs', nameField: 'm_cat_name', dataField: 'macbookCatalogs', includeIdInUrl: false },
    { path: 'windows', url: '/api/windows-catalogs', nameField: 'w_cat_name', dataField: 'windowsCatalogs', includeIdInUrl: false },
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Fetching API: ${baseUrl}${endpoint.url} ✓`); // Debug
      const res: AxiosResponse<ApiResponse> = await axios.get<ApiResponse>(`${baseUrl}${endpoint.url}`);
      // console.log(`API Response for ${endpoint.path}:`, res.data); // Debug

      let data: Item[] = [];
      if ('success' in res.data && Array.isArray(res.data.data)) {
        data = res.data.data;
      } else if (endpoint.dataField in res.data && Array.isArray(res.data[endpoint.dataField])) {
        data = res.data[endpoint.dataField] as Item[];
      }

      if (data.length > 0) {
        const segmentPaths = data.map((item: Item) => {
          const slug = slugify(item[endpoint.nameField] || '');
          const lastModified = item.updatedAt ? new Date(item.updatedAt) : new Date();

          const url = endpoint.includeIdInUrl
            ? `https://www.7teck.vn/${endpoint.path}/${slug}/${item._id}`
            : `https://www.7teck.vn/${endpoint.path}/${slug}`;

          return {
            url,
            lastModified,
            changeFrequency: 'daily' as const,
            priority: 0.7,
          };
        });

        paths.push(...segmentPaths);
      } else {
        console.log(`No valid data for ${endpoint.path}`); // Debug
      }
    } catch (err) {
      console.error(`Error fetching ${endpoint.path}:`, (err as Error).message); // Debug
    }
  }

  console.log('Dynamic Paths:', paths); // Debug
  return paths;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: 'https://www.7teck.vn',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: 'https://www.7teck.vn/dien-thoai',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: 'https://www.7teck.vn/may-tinh-bang',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: 'https://www.7teck.vn/macbook',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: 'https://www.7teck.vn/windows',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: 'https://www.7teck.vn/bang-gia-thu-mua',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: 'https://www.7teck.vn/thanh-toan',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: 'https://www.7teck.vn/thu-thuat-va-meo-hay',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: 'https://www.7teck.vn/tin-tuc-moi-nhat',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: 'https://www.7teck.vn/thiet-bi-da-qua-su-dung',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: 'https://www.7teck.vn/chinh-sach-quyen-rieng-tu',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: 'https://www.7teck.vn/dieu-khoan-dich-vu',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: 'https://www.7teck.vn/chinh-sach-bao-hanh',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: 'https://www.7teck.vn/hanh-trinh-khach-hang',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
  ];

  const dynamicPages = await getDynamicPaths();
  console.log('Total Pages:', [...staticPages, ...dynamicPages].length); // Debug

  const allPages = [...staticPages, ...dynamicPages].filter((page) => !page.url.includes('/cms/'));

  return allPages.slice(0, 5000);
}
