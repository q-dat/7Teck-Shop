import { IPost } from '@/types/type/products/post/post';
import { getServerApiUrl } from '../../hooks/useApiUrl';
import { getWithFallback } from './shared/getWithFallback';

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
  const posts = await getPostsByCatalog('');

  return posts.filter((p) => {
    const catalog = p.catalog?.toLowerCase() ?? '';
    return !catalog.includes('mẹo');
  });
}

export async function getAllTipsAndTricks(): Promise<IPost[]> {
  return getPostsByCatalog('mẹo');
}
export async function getAllPosts(): Promise<IPost[]> {
  return getPostsByCatalog('');
}

export async function getPostById(id: string): Promise<IPost | null> {
  const apiUrl = getServerApiUrl(`/api/post/${id}`);

  const res = await fetch(apiUrl, {
    // Không được dùng cache: "no-store"
    // Để Next.js tự cache theo revalidate của page
    // next: { revalidate: 18000 }, // chỉ dùng nếu muốn override tại đây
  });

  if (!res.ok) return null;

  const data = await res.json();
  return data?.posts ?? null;
}

export async function getPostWithFallback(id: string): Promise<IPost | null> {
  return getWithFallback<IPost>(id, getAllPosts, getPostById);
}
