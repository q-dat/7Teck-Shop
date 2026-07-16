import { IGallery } from '@/types/type/gallery/gallery';
import { getServerApiUrl } from '../../hooks/useApiUrl';

// Gọi API riêng của 7Teck-Shop (src/app/api/galleries), route này forward dữ liệu
// từ BE 7teck. BE giữ nguyên làm nguồn; shop có API trung gian riêng theo logic cũ.
export async function getAllGallerys(): Promise<IGallery[]> {
  try {
    const apiUrl = `${getServerApiUrl('/api/galleries')}`;
    const res = await fetch(apiUrl, {
      cache: 'no-store',
    });

    if (!res.ok) throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);

    const data = await res.json();

    if (!data || typeof data !== 'object' || !Array.isArray(data.galleries)) {
      console.warn('Dữ liệu API Gallery không hợp lệ:', data);
      return [];
    }

    return data.galleries;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách Gallery:', error);
    return [];
  }
}

export async function getGalleryById(id: string): Promise<IGallery | null> {
  try {
    const apiUrl = getServerApiUrl(`/api/gallery/${id}`);
    const res = await fetch(apiUrl, {
      cache: 'no-store',
    });

    if (!res.ok) throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);

    const data = await res.json();

    if (!data || typeof data !== 'object' || !data.gallery) {
      console.warn('Dữ liệu API Gallery theo ID không hợp lệ:', data);
      return null;
    }

    return data.gallery;
  } catch (error) {
    console.error('Lỗi khi lấy Gallery:', error);
    return null;
  }
}
