import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import Phone from '@/app/models/phone';
import Tablet from '@/app/models/tablet';
import Macbook from '@/app/models/macbook';
import Windows from '@/app/models/windows';
import { slugify } from '@/utils/slugify';

interface SearchableItem {
  _id: string;
  [key: string]: any;
}

interface CollectionMeta {
  model: typeof Phone | typeof Tablet | typeof Macbook | typeof Windows;
  slugField: string;
  collectionName: string;
  url: string;
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim();

    if (!q) {
      return NextResponse.json({ message: 'Thiếu từ khóa tìm kiếm', success: false }, { status: 400 });
    }

    const searchSlug = slugify(q);
    const isObjectId = ObjectId.isValid(q);

    const collections: CollectionMeta[] = [
      { model: Phone, slugField: 'name', collectionName: 'phones', url: '/dien-thoai' },
      { model: Tablet, slugField: 'tablet_name', collectionName: 'tablets', url: '/may-tinh-bang' },
      { model: Macbook, slugField: 'macbook_name', collectionName: 'macbooks', url: '/macbook' },
      { model: Windows, slugField: 'windows_name', collectionName: 'windows', url: '/windows' },
    ];

    const matchedLinks: string[] = [];

    for (const { model, slugField, url } of collections) {
      // 1. Tìm theo ObjectId
      if (isObjectId) {
        const foundById = await model.findById(q).select(`${slugField} _id`).lean<SearchableItem>();
        if (foundById && foundById[slugField]) {
          const slug = slugify(foundById[slugField]);
          matchedLinks.push(`${url}/${slug}/${foundById._id}`);
        }
      }

      // 2. So sánh chính xác slug
      const items = await model.find().select(`${slugField} _id`).lean<SearchableItem[]>();
      for (const item of items) {
        const itemSlug = slugify(item[slugField]);
        if (itemSlug === searchSlug) {
          matchedLinks.push(`${url}/${itemSlug}/${item._id}`);
        }
      }

      // 3. Fallback tìm gần đúng
      const fuzzyMatches = await model
        .find({ [slugField]: { $regex: q, $options: 'i' } })
        .select(`${slugField} _id`)
        .lean<SearchableItem[]>();
      for (const item of fuzzyMatches) {
        const itemSlug = slugify(item[slugField]);
        const link = `${url}/${itemSlug}/${item._id}`;
        if (!matchedLinks.includes(link)) {
          matchedLinks.push(link);
        }
      }
    }

    if (matchedLinks.length === 0) {
      return NextResponse.json({ message: 'Không tìm thấy sản phẩm phù hợp', success: false }, { status: 404 });
    }

    return NextResponse.json({ success: true, links: matchedLinks });
  } catch (err) {
    console.error('❌ Lỗi search API:', err);
    return NextResponse.json({ message: 'Lỗi server', success: false }, { status: 500 });
  }
}
