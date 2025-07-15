import { connectRedis, default as redis } from './redis';
import { loadCache, getCache } from './searchCache';

const REDIS_CACHE_KEY = 'search_cache_v1';
let cacheWarmed = false;

export async function warmUpRedisCacheIfNeeded() {
  if (cacheWarmed) return;

  await connectRedis();

  const existing = await redis.get(REDIS_CACHE_KEY);
  if (!existing) {
    console.log('🚀 Redis warm-up: cache not found, loading...');
    await loadCache();
    const data = getCache();
    await redis.set(REDIS_CACHE_KEY, JSON.stringify(data));
    console.log(`✅ Redis warmed up: ${data.length} items`);
  } else {
    console.log('🟢 Redis cache already exists. Skipping warm-up.');
  }

  cacheWarmed = true;
}
