import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { slugify } from '@/utils/slugify';
import redis, { connectRedis } from '@/lib/redis';
import { loadCache, CachedItem, getCache } from '@/lib/searchCache';
import { warmUpRedisCacheIfNeeded } from '@/lib/warmupCache';

const REDIS_CACHE_KEY = 'search_cache_v1';

const keywordMap: Record<string, string> = {
  ip: 'iphone',
  ss: 'samsung',
  mb: 'macbook',
  mtb: 'ipad',
  wm: 'windows',
  gb: 'gb',
  pr: 'pro',
  prx: 'promax',
  prm: 'promax',
  pls: 'plus',
};

async function getCacheFromRedis(): Promise<CachedItem[]> {
  await connectRedis();
  const raw = await redis.get(REDIS_CACHE_KEY);

  if (raw) {
    const parsed = JSON.parse(raw) as CachedItem[];
    console.log(`📦 Redis cache hit: ${parsed.length} items`);
    return parsed;
  }

  console.log('🚫 Redis cache miss — loading from source...');
  await loadCache();
  const data = getCache();
  console.log(`✅ Cache loaded from DB: ${data.length} items`);
  return data;
}
export async function GET(req: Request) {
  const t0 = performance.now();

  try {
    await warmUpRedisCacheIfNeeded();
    const cachedData = await getCacheFromRedis();

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim();

    if (!q) {
      return NextResponse.json({ message: 'Thiếu từ khóa tìm kiếm', success: false }, { status: 400 });
    }

    // Chuẩn hóa từ khóa tìm kiếm
    const normalizedQ = q
      .toLowerCase()
      .replace(/\s+/g, '') // bỏ khoảng trắng
      .split(/(\d+)/) // tách chữ và số riêng biệt để match tốt hơn
      .filter(Boolean)
      .map((part) => keywordMap[part] || part)
      .join('');

    const slugifiedQ = slugify(normalizedQ); // ip15promax
    const isObjectId = ObjectId.isValid(q);

    const results: CachedItem[] = [];

    // 1. Tìm theo ObjectId
    if (isObjectId) {
      const found = cachedData.find((item) => item._id === q);
      if (found) results.push(found);
    }

    // 2. So khớp slug tuyệt đối
    const exactMatch = cachedData.find((item) => {
      return slugify(item.slug.replace(/\s+/g, '')) === slugifiedQ;
    });

    if (exactMatch && !results.some((r) => r._id === exactMatch._id)) {
      results.push(exactMatch);
    }

    // 3. So khớp gần đúng theo tên
    for (const item of cachedData) {
      const normalizedItemName = slugify(item.name.toLowerCase().replace(/\s+/g, ''));
      if (normalizedItemName.includes(slugifiedQ) && !results.some((r) => r._id === item._id)) {
        results.push(item);
      }
    }

    const t1 = performance.now();
    console.log('⏱️ Total search time(ms):', t1 - t0);

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
    console.error('Lỗi:', err);
    return NextResponse.json({ message: 'Lỗi server', success: false }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
