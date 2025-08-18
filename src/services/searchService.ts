interface SearchResult {
  name: string;
  link: string;
  image: string;
}

const cache = new Map<string, { results: SearchResult[]; expires: number }>();
const CACHE_TTL = 60 * 1000;

export const searchProducts = async (query: string): Promise<SearchResult[]> => {
  const now = Date.now();
  const cached = cache.get(query);
  if (cached && now < cached.expires) return cached.results;

  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  const data = await res.json();

  if (data.success) {
    cache.set(query, { results: data.results, expires: now + CACHE_TTL });
    return data.results;
  }

  return [];
};
