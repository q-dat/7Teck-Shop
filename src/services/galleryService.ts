import { IGallery } from '@/types/type/gallery/gallery';
import { fetchWithBackendFallback } from '@/lib/server/fetchWithBackendFallback';

// Gọi trực tiếp API nguyên bản từ backend 7teck (NEXT_PUBLIC_API_BASE_URL),
// bỏ hoàn toàn logic proxy localhost cũ. Dùng fetchWithBackendFallback để có
// fallback an toàn khi BE không khả dụng (trả về mảng/rỗng thay vì throw).
const GALLERIES_PATH = '/api/galleries';
const GALLERY_PATH = '/api/gallery';

export async function getAllGallerys(): Promise<IGallery[]> {
  try {
    const data = await fetchWithBackendFallback<{ galleries: IGallery[] }>({
      backendPath: GALLERIES_PATH,
      fallback: async () => ({ galleries: [] }),
    });

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
    const data = await fetchWithBackendFallback<{ gallery: IGallery }>({
      backendPath: `${GALLERY_PATH}/${id}`,
      fallback: async () => ({ gallery: null as unknown as IGallery }),
    });

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
