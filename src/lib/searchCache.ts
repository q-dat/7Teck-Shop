import { connectDB } from './mongodb';
import { slugify } from '@/utils/slugify';
import Phone from '@/app/models/phone';
import Tablet from '@/app/models/tablet';
import Macbook from '@/app/models/macbook';
import Windows from '@/app/models/windows';

export type CachedItem = {
  _id: string;
  name: string;
  slug: string;
  link: string;
  image: string;
};

// Định nghĩa chung cho dữ liệu từ DB (sau khi lean)
interface RawItem {
  _id: string | { toString(): string };
  [key: string]: unknown;
}

let CACHE: CachedItem[] = [];
let IS_CACHE_LOADED = false;

const COLLECTIONS = [
  { model: Phone, nameField: 'name', url: '/dien-thoai', imageField: 'img' },
  { model: Tablet, nameField: 'tablet_name', url: '/may-tinh-bang', imageField: 'tablet_img' },
  { model: Macbook, nameField: 'macbook_name', url: '/macbook', imageField: 'macbook_img' },
  { model: Windows, nameField: 'windows_name', url: '/windows', imageField: 'windows_img' },
];

// ✅ Sửa lỗi reduce: gán đúng kiểu initial value
function getNestedValue(obj: unknown, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (typeof current === 'object' && current !== null && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return '';
    }
  }

  return typeof current === 'string' ? current : '';
}

export async function loadCache() {
  if (IS_CACHE_LOADED) return;

  await connectDB();

  const allItems: CachedItem[] = [];

  for (const { model, nameField, url, imageField } of COLLECTIONS) {
    // ❗ Lean trả về object kiểu unknown => ép kiểu thủ công
    const items = (await model.find().select(`${nameField} ${imageField} _id`).lean()) as RawItem[];

    items.forEach((item) => {
      const rawName = item[nameField];
      if (typeof rawName === 'string') {
        const slug = slugify(rawName);
        const image = getNestedValue(item, imageField);

        allItems.push({
          _id: String(item._id),
          name: rawName,
          slug,
          image,
          link: `${url}/${slug}/${item._id}`,
        });
      }
    });
  }

  CACHE = allItems;
  IS_CACHE_LOADED = true;
  console.log(`✅ Cache loaded: ${CACHE.length} items`);
}

export function getCache(): CachedItem[] {
  return CACHE;
}
