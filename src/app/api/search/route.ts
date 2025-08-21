import { NextResponse } from 'next/server';
import { getCache, CachedItem, keywordMap } from '@/lib/searchCache';
import { ObjectId } from 'mongodb';

function normalizeString(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Kiểm tra query nhiều từ có match tên sản phẩm
function queryMatchesName(query: string, name: string) {
  const qTokens = query
    .toLowerCase()
    .split(/\s+/)
    .map((w) => keywordMap[w] || w)
    .map(normalizeString)
    .filter(Boolean);

  const normalizedName = normalizeString(name);

  // Tất cả từ query phải xuất hiện ít nhất 1 lần trong name
  return qTokens.every((token) => normalizedName.includes(token));
}

export async function GET(req: Request) {
  try {
    const cachedData = await getCache();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim();
    if (!q) return NextResponse.json({ message: 'Thiếu từ khóa', success: false }, { status: 400 });

    const isObjectId = ObjectId.isValid(q);
    const results: CachedItem[] = [];

    // 1. Tìm theo ObjectId
    if (isObjectId) {
      const found = cachedData.find((item) => item._id === q);
      if (found) results.push(found);
    }

    // 2. Fuzzy match theo từng từ query
    for (const item of cachedData) {
      if (queryMatchesName(q, item.name) && !results.some((r) => r._id === item._id)) {
        results.push(item);
      }
    }

    if (!results.length) {
      return NextResponse.json({ message: 'Không tìm thấy sản phẩm', success: false }, { status: 404 });
    }

    return NextResponse.json({ success: true, results }, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=60' } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Lỗi server', success: false }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
