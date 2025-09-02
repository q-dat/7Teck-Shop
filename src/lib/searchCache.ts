import { connectDB } from './mongodb';
import { slugify } from '@/utils/slugify';
import Phone from '@/app/models/phone';
import Tablet from '@/app/models/tablet';
import Macbook from '@/app/models/macbook';
import Windows from '@/app/models/windows';

// Bảng ánh xạ từ khóa mở rộng để hỗ trợ viết tắt phổ biến
export const keywordMap: Record<string, string> = {
  ip: 'iphone',
  ip14: 'iphone 14',
  ip15: 'iphone 15',
  ip16: 'iphone 16',
  ip17: 'iphone 17',
  ss: 'samsung',
  mb: 'macbook',
  mtb: 'ipad',
  wm: 'windows',
  gb: 'gb',
  pr: 'pro',
  prx: 'promax',
  prm: 'promax',
  pm: 'promax',
  pls: 'plus',
  pl: 'plus',
};

export type CachedItem = {
  _id: string;
  name: string;
  slug: string;
  link: string;
  image: string;
  color?: string;
  price?: number;
  sale?: number;
  status?: string;
  catalogId?: string;
};

interface RawItem {
  _id: string | { toString(): string };
  [key: string]: unknown;
}

let CACHE: CachedItem[] = [];
let lastLoaded = 0;
const CACHE_TTL = 60 * 1000; // 1 phút

const COLLECTIONS = [
  {
    model: Phone,
    nameField: 'name',
    url: '/dien-thoai',
    imageField: 'img',
    colorField: 'color',
    priceField: 'price',
    saleField: 'sale',
    statusField: 'status',
    catalogField: 'phone_catalog_id',
  },
  {
    model: Tablet,
    nameField: 'tablet_name',
    url: '/may-tinh-bang',
    imageField: 'tablet_img',
    colorField: 'tablet_color',
    priceField: 'tablet_price',
    saleField: 'tablet_sale',
    statusField: 'tablet_status',
    catalogField: 'tablet_catalog_id',
  },
  {
    model: Macbook,
    nameField: 'macbook_name',
    url: '/macbook',
    imageField: 'macbook_img',
    colorField: 'macbook_color',
    priceField: 'macbook_price',
    saleField: 'macbook_sale',
    statusField: 'macbook_status',
    catalogField: 'macbook_catalog_id',
  },
  {
    model: Windows,
    nameField: 'windows_name',
    url: '/windows',
    imageField: 'windows_img',
    colorField: 'windows_color',
    priceField: 'windows_price',
    saleField: 'windows_sale',
    statusField: 'windows_status',
    catalogField: 'windows_catalog_id',
  },
];

function getNestedValue(obj: unknown, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (typeof current === 'object' && current !== null && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else return '';
  }
  return typeof current === 'string' ? current : '';
}

export async function loadCache() {
  await connectDB();
  const allItems: CachedItem[] = [];

  for (const { model, nameField, url, imageField, colorField, priceField, saleField, statusField, catalogField } of COLLECTIONS) {
    const items = (await model
      .find()
      .select(`${nameField} ${imageField} ${colorField} ${priceField} ${saleField} ${statusField} ${catalogField} _id`)
      .lean()) as RawItem[];

    items.forEach((item) => {
      const rawName = item[nameField];
      if (typeof rawName === 'string') {
        const slug = slugify(rawName);
        const image = getNestedValue(item, imageField);
        const color = getNestedValue(item, colorField);
        const price = item[priceField];
        const sale = item[saleField];
        const status = item[statusField] ? String(item[statusField]) : undefined;
        const catalogId = item[catalogField] ? String(item[catalogField]) : undefined;

        allItems.push({
          _id: String(item._id),
          name: rawName,
          slug,
          image,
          color: typeof color === 'string' ? color : undefined,
          price: typeof price === 'number' ? price : undefined,
          sale: typeof sale === 'number' ? sale : undefined,
          status,
          catalogId,
          link: `${url}/${slug}/${item._id}`,
        });
      }
    });
  }

  CACHE = allItems;
  lastLoaded = Date.now();
  console.log(`✅ Cache loaded: ${CACHE.length} items`);
}

export async function getCache(): Promise<CachedItem[]> {
  if (Date.now() - lastLoaded < CACHE_TTL && CACHE.length > 0) return CACHE;
  await loadCache();
  return CACHE;
}
