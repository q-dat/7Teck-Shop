import { connectRedis, default as redis } from '@/lib/redis';
import { loadCache } from '@/lib/searchCache';

export const refreshRedisCache = async () => {
  await connectRedis();
  await redis.del('search_cache_v1');
  await loadCache();
};
