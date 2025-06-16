import { getServerApiUrl } from '../../hooks/useApiUrl';
import { IGallery } from '@/types/type/gallery/gallery';

export async function getAllGallerys(): Promise<IGallery[]> {
  try {
    const apiUrl = `${getServerApiUrl('/api/galleries')}`;
    const res = await fetch(apiUrl, {
      cache: 'force-cache',
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);

    const data = await res.json();
    // console.log('Gallery API response:', data); // Debug response

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
      cache: 'force-cache',
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);

    const data = await res.json();
    // console.log('Gallery by ID API response:', data); // Debug response

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
