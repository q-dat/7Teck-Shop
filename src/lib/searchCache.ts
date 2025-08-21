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
  a36: 'samsung galaxy a36',
  s25: 'samsung galaxy s25',
  mb: 'macbook',
  mtb: 'ipad',
  wm: 'windows',
  gb: 'gb',
  pr: 'pro',
  prx: 'promax',
  prm: 'promax',
  pls: 'plus',
};

export type CachedItem = {
  _id: string;
  name: string;
  slug: string;
  link: string;
  image: string;
  color?: string;
  price?: number;
};

interface RawItem {
  _id: string | { toString(): string };
  [key: string]: unknown;
}

let CACHE: CachedItem[] = [];
let lastLoaded = 0;
const CACHE_TTL = 60 * 1000; // 1 phút

const COLLECTIONS = [
  { model: Phone, nameField: 'name', url: '/dien-thoai', imageField: 'img', colorField: 'color', priceField: 'price' },
  {
    model: Tablet,
    nameField: 'tablet_name',
    url: '/may-tinh-bang',
    imageField: 'tablet_img',
    colorField: 'tablet_color',
    priceField: 'tablet_price',
  },
  { model: Macbook, nameField: 'macbook_name', url: '/macbook', imageField: 'macbook_img', colorField: 'macbook_color', priceField: 'macbook_price' },
  { model: Windows, nameField: 'windows_name', url: '/windows', imageField: 'windows_img', colorField: 'windows_color', priceField: 'windows_price' },
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

  for (const { model, nameField, url, imageField, colorField, priceField } of COLLECTIONS) {
    const items = (await model.find().select(`${nameField} ${imageField} ${colorField} ${priceField} _id`).lean()) as RawItem[];
    items.forEach((item) => {
      const rawName = item[nameField];
      if (typeof rawName === 'string') {
        const slug = slugify(rawName);
        const image = getNestedValue(item, imageField);
        const color = getNestedValue(item, colorField);
        const price = item[priceField];

        allItems.push({
          _id: String(item._id),
          name: rawName,
          slug,
          image,
          color: typeof color === 'string' ? color : undefined,
          price: typeof price === 'number' ? price : undefined,
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
