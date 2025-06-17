import { IPost } from '@/types/type/post/post';
import { getServerApiUrl } from '../../hooks/useApiUrl';

export async function getAllPosts(): Promise<IPost[]> {
  try {
    const apiUrl = `${getServerApiUrl('/api/posts')}`;
    const res = await fetch(apiUrl, {
      cache: 'force-cache',
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);

    const data = await res.json();
    // console.log('Post API response:', data); // Debug response

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

export async function getPostById(id: string): Promise<IPost | null> {
  try {
    const apiUrl = getServerApiUrl(`/api/post/${id}`);
    const res = await fetch(apiUrl, {
      cache: 'force-cache',
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);

    const data = await res.json();
    // console.log('Post by ID API response:', data); // Debug response

    if (!data || typeof data !== 'object' || !data.post) {
      console.warn('Dữ liệu API Post theo ID không hợp lệ:', data);
      return null;
    }

    return data.post;
  } catch (error) {
    console.error('Lỗi khi lấy Post:', error);
    return null;
  }
}
