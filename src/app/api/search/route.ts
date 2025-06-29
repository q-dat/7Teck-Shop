import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import Phone from '@/app/models/phone';
import Tablet from '@/app/models/tablet';
import Macbook from '@/app/models/macbook';
import Windows from '@/app/models/windows';
import { slugify } from '@/utils/slugify';

const keywordMap: Record<string, string> = {
  ip: 'iphone',
  ss: 'samsung',
  mb: 'macbook',
  mtb: 'ipab',
  wm: 'windows',
  gb: 'gb',
  pr: 'pro',
  prx: 'promax',
  prm: 'pro max',
  pls: 'plus',
};

interface SearchableItem {
  _id: string;
  [key: string]: string | number | boolean | undefined;
}

interface MatchedResult {
  name: string;
  link: string;
  image: string;
}

interface CollectionMeta {
  model: typeof Phone | typeof Tablet | typeof Macbook | typeof Windows;
  slugField: string;
  collectionName: string;
  url: string;
  imageField: string;
}

function getNestedValue(obj: unknown, path: string): string {
  if (typeof obj !== 'object' || obj === null) return '';
  const keys = path.split('.');
  let value: unknown = obj;
  for (const key of keys) {
    if (typeof value === 'object' && value !== null && key in value) {
      value = (value as Record<string, unknown>)[key];
    } else {
      return '';
    }
  }
  return typeof value === 'string' ? value : '';
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';

    if (!q) {
      return NextResponse.json({ message: 'Thiếu từ khóa tìm kiếm', success: false }, { status: 400 });
    }

    const normalizedQ = q
      .toLowerCase()
      .split(' ')
      .map((word) => keywordMap[word] || word)
      .join(' ');
    const searchSlug = slugify(normalizedQ);
    const isObjectId = ObjectId.isValid(q);

    const collections: CollectionMeta[] = [
      { model: Phone, slugField: 'name', collectionName: 'phones', url: '/dien-thoai', imageField: 'img' },
      { model: Tablet, slugField: 'tablet_name', collectionName: 'tablets', url: '/may-tinh-bang', imageField: 'tablet_img' },
      { model: Macbook, slugField: 'macbook_name', collectionName: 'macbooks', url: '/macbook', imageField: 'macbook_img' },
      { model: Windows, slugField: 'windows_name', collectionName: 'windows', url: '/windows', imageField: 'windows_img' },
    ];

    const matchedResults: MatchedResult[] = [];

    for (const { model, slugField, url, imageField } of collections) {
      // 1. Tìm theo ObjectId
      if (isObjectId) {
        const foundById = await model.findById(q).select(`${slugField} ${imageField} _id`).lean<SearchableItem>();
        if (foundById && foundById[slugField]) {
          const slug = slugify(String(foundById[slugField]));
          matchedResults.push({
            name: String(foundById[slugField]),
            link: `${url}/${slug}/${foundById._id}`,
            image: getNestedValue(foundById, imageField),
          });
        }
      }

      // 2. So sánh slug chính xác
      const items = await model.find().select(`${slugField} ${imageField} _id`).lean<SearchableItem[]>();
      for (const item of items) {
        const itemSlug = slugify(String(item[slugField]));
        if (itemSlug === searchSlug) {
          matchedResults.push({
            name: String(item[slugField]),
            link: `${url}/${itemSlug}/${item._id}`,
            image: getNestedValue(item, imageField),
          });
        }
      }

      // 3. Fallback tìm gần đúng
      const fuzzyMatches = await model
        .find({ [slugField]: { $regex: normalizedQ, $options: 'i' } })
        .select(`${slugField} ${imageField} _id`)
        .lean<SearchableItem[]>();
      for (const item of fuzzyMatches) {
        const itemSlug = slugify(String(item[slugField]));
        const link = `${url}/${itemSlug}/${item._id}`;
        if (!matchedResults.find((r) => r.link === link)) {
          matchedResults.push({
            name: String(item[slugField]),
            link,
            image: getNestedValue(item, imageField),
          });
        }
      }
    }

    if (matchedResults.length === 0) {
      return NextResponse.json({ message: 'Không tìm thấy sản phẩm phù hợp', success: false }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, results: matchedResults },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      }
    );
  } catch (err) {
    console.error('❌ Lỗi search API:', err);
    return NextResponse.json({ message: 'Lỗi server', success: false }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache 1 giờ
