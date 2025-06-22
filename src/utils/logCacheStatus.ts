export function logCacheStatus(res: Response, key: string): void {
  const cacheHeader = res.headers.get('x-vercel-cache');

  if (cacheHeader === 'HIT') {
    console.log(`✅ Cache HIT for ${key}`);
  } else if (cacheHeader === 'MISS') {
    console.log(`🚫 Cache MISS for ${key}`);
  } else if (cacheHeader === 'STALE') {
    console.log(`♻️ Cache STALE for ${key}`);
  } else {
    console.log(`ℹ️ x-vercel-cache header not present for ${key}`);
  }
}
