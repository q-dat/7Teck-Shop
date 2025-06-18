import { MetadataRoute } from 'next';
import axios from 'axios';

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
    { path: 'dien-thoai', url: '/api/phones', nameField: 'name', dataField: 'phones' },
    { path: 'may-tinh-bang', url: '/api/tablets', nameField: 'tablet_name', dataField: 'tablets' },
    { path: 'macbook', url: '/api/laptop-macbook', nameField: 'macbook_name', dataField: 'macbook' },
    { path: 'windows', url: '/api/laptop-windows', nameField: 'windows_name', dataField: 'windows' },
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Fetching API: ${baseUrl}${endpoint.url}`); // Debug
      const res = await axios.get(`${baseUrl}${endpoint.url}`);
      // console.log(`API Response for ${endpoint.path}:`, res.data); // Debug

      // Xử lý dữ liệu dựa trên format API
      let data: any[] = [];
      if ('success' in res.data && Array.isArray(res.data.data)) {
        // Format cũ: { success, data }
        data = res.data.data;
      } else if (endpoint.dataField in res.data && Array.isArray(res.data[endpoint.dataField])) {
        // Format mới: { message, count, [dataField] }
        data = res.data[endpoint.dataField];
      }

      if (data.length > 0) {
        const segmentPaths = data.map((item: any) => {
          console.log(`Processing item: ${item[endpoint.nameField]} (${item._id})`); // Debug
          return {
            url: `https://www.7teck.vn/${endpoint.path}/${slugify(item[endpoint.nameField])}/${item._id}`,
            lastModified: item.updatedAt ? new Date(item.updatedAt) : new Date(),
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
  // Các trang tĩnh
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: 'https://www.7teck.vn',
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
      url: 'https://www.7teck.vn/chinh-sach-bao-hanh',
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
      url: 'https://www.7teck.vn/hanh-trinh-khach-hang',
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
      url: 'https://www.7teck.vn/may-tinh-bang',
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
      url: 'https://www.7teck.vn/windows',
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
  ];

  // Lấy các trang động từ API
  const dynamicPages = await getDynamicPaths();
  console.log('Total Pages:', [...staticPages, ...dynamicPages].length); // Debug

  // Kết hợp và loại trừ các đường dẫn không mong muốn
  const allPages = [...staticPages, ...dynamicPages].filter((page) => !page.url.includes('/cms/'));

  return allPages.slice(0, 5000);
}
