import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { slugify } from '@/utils/slugify';
import { loadCache, getCache, CachedItem } from '@/lib/searchCache';

const keywordMap: Record<string, string> = {
  ip: 'iphone',
  ss: 'samsung',
  mb: 'macbook',
  mtb: 'ipad',
  wm: 'windows',
  gb: 'gb',
  pr: 'pro',
  prx: 'promax',
  prm: 'pro max',
  pls: 'plus',
};

export async function GET(req: Request) {
  try {
    await loadCache();
    const CACHE = getCache();

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim();

    if (!q) {
      return NextResponse.json({ message: 'Thiếu từ khóa tìm kiếm', success: false }, { status: 400 });
    }

    const normalizedQ = q
      .toLowerCase()
      .split(' ')
      .map((word) => keywordMap[word] || word)
      .join(' ');

    const slugifiedQ = slugify(normalizedQ);
    const isObjectId = ObjectId.isValid(q);

    const results: CachedItem[] = [];

    // 1. Tìm theo ObjectId
    if (isObjectId) {
      const found = CACHE.find((item) => item._id === q);
      if (found) results.push(found);
    }

    // 2. So sánh slug chính xác
    CACHE.forEach((item) => {
      if (item.slug === slugifiedQ && !results.some((r) => r._id === item._id)) {
        results.push(item);
      }
    });

    // 3. Tìm gần đúng theo name
    CACHE.forEach((item) => {
      if (item.name.toLowerCase().includes(normalizedQ) && !results.some((r) => r._id === item._id)) {
        results.push(item);
      }
    });

    if (results.length === 0) {
      return NextResponse.json({ message: 'Không tìm thấy sản phẩm phù hợp', success: false }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, results },
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
export const revalidate = 3600;
