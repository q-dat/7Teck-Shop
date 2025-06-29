interface SearchResult {
  name: string;
  link: string;
  image: string;
}

const cache = new Map<string, SearchResult[]>();

export const searchProducts = async (query: string): Promise<SearchResult[]> => {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) return [];

  // Check cache trước
  if (cache.has(trimmedQuery)) {
    return cache.get(trimmedQuery)!;
  }

  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(trimmedQuery)}`);
    const data = await res.json();

    if (data.success) {
      cache.set(trimmedQuery, data.results);
      return data.results;
    }

    return [];
  } catch (error) {
    console.error('Search API error:', error);
    return [];
  }
};
