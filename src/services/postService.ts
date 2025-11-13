import { IPost } from '@/types/type/products/post/post';
import { getServerApiUrl } from '../../hooks/useApiUrl';

export async function getPostsByCatalog(catalog: string): Promise<IPost[]> {
  try {
    const query = `?catalog=${catalog}`;
    const apiUrl = `${getServerApiUrl(`/api/posts${query}`)}`;
    const res = await fetch(apiUrl, {
      cache: 'force-cache',
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);

    const data = await res.json();
    // console.log('Post API response:', data, apiUrl); // Debug response

    if (!data || typeof data !== 'object' || !Array.isArray(data.posts)) {
      console.warn('Dữ liệu API Post không hợp lệ:', data);
      return [];
    }

    return data.posts;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách Posts:', error);
    return [];
  }
}
export async function getAllNews(): Promise<IPost[]> {
  return getPostsByCatalog('tin');
}
export async function getAllTipsAndTricks(): Promise<IPost[]> {
  return getPostsByCatalog('mẹo');
}
export async function getAllPosts(): Promise<IPost[]> {
  return getPostsByCatalog('');
}

// Cache server-side theo URL
type PostCacheEntry = { data: IPost; timestamp: number };
const postCacheById: Record<string, PostCacheEntry> = {};
const CACHE_TTL = 60_000; // 1 phút

export async function getPostById(id: string): Promise<IPost | null> {
  const apiUrl = getServerApiUrl(`/api/post/${id}`);

  const now = Date.now();
  // Check cache
  const cached = postCacheById[apiUrl];
  if (cached && now - cached.timestamp < CACHE_TTL) {
    console.log('Cache hit for post ID:', id);
    return cached.data;
  }

  try {
    console.log('Fetching post detail:', apiUrl);
    const res = await fetch(apiUrl, { cache: 'no-store' });

    if (!res.ok) throw new Error(`Fetch post lỗi: ${res.status} ${res.statusText}`);

    const data = await res.json();
    if (!data || !data.post) return null;

    // Lưu cache
    postCacheById[apiUrl] = { data: data.post, timestamp: now };
    console.log('Cache saved for post ID:', id);

    return data.post;
  } catch (error) {
    console.error('Lỗi tải post:', error);
    return cached?.data ?? null; // fallback dùng cache nếu có
  }
}

// Hàm log snapshot cache
export function logPostCache() {
  // console.log('[Post Cache Snapshot]:', postCacheById);
}

// Hàm clear cache
export function invalidatePostCache() {
  for (const key in postCacheById) delete postCacheById[key];
  console.log('Post cache cleared');
}
