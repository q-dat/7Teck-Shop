import { logCacheStatus } from '@/utils/logCacheStatus';
import { getServerApiUrl } from '../../../hooks/useApiUrl';
import { ITablet } from '@/types/type/products/tablet/tablet';

export async function getAllTablets(): Promise<ITablet[]> {
  try {
    const apiUrl = `${getServerApiUrl('/api/tablets')}`;
    const res = await fetch(apiUrl, {
      cache: 'force-cache',
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);

    const data = await res.json();
    // console.log('Tablet API response:', data); // Debug response

    if (!data || typeof data !== 'object' || !Array.isArray(data.tablets)) {
      console.warn('Dữ liệu API Tablet không hợp lệ:', data);
      return [];
    }

    return data.tablets;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách tablet:', error);
    return [];
  }
}

export async function getTabletById(id: string): Promise<ITablet | null> {
  try {
    const apiUrl = getServerApiUrl(`/api/tablet/${id}`);
    const res = await fetch(apiUrl, {
      cache: 'force-cache',
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Lỗi API: ${res.status} ${res.statusText} - ${errorText}`);
    }

    // Kiểm tra trạng thái cache
    logCacheStatus(res, `tablets:${id}`);
    const data = await res.json();

    if (!data || typeof data !== 'object' || !data.tablet) {
      console.warn('Dữ liệu API Tablet theo ID không hợp lệ:', data);
      return null;
    }

    return data.tablet;
  } catch (error) {
    console.error('Lỗi khi lấy tablet:', error);
    return null;
  }
}
