import { logCacheStatus } from '@/utils/logCacheStatus';
import { getServerApiUrl } from '../../../hooks/useApiUrl';
import { IMacbook } from '../../types/type/products/macbook/macbook';

export async function getAllMacbook(): Promise<IMacbook[]> {
  try {
    const apiUrl = `${getServerApiUrl('/api/laptop-macbook')}`;
    const res = await fetch(apiUrl, {
      cache: 'force-cache',
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);

    const data = await res.json();
    // console.log('Macbook API response:', data); // Debug response

    if (!data || typeof data !== 'object' || !Array.isArray(data.macbook)) {
      console.warn('Dữ liệu API Macbook không hợp lệ:', data);
      return [];
    }

    return data.macbook;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách macbook:', error);
    return [];
  }
}

export async function getMacbookById(id: string): Promise<IMacbook | null> {
  try {
    const apiUrl = getServerApiUrl(`/api/macbook/${id}`);
    const res = await fetch(apiUrl, {
      cache: 'force-cache',
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Lỗi API: ${res.status} ${res.statusText} - ${errorText}`);
    }

    // Kiểm tra trạng thái cache
    logCacheStatus(res, `macbook:${id}`);
    const data = await res.json();

    if (!data || typeof data !== 'object' || !data.macbook) {
      console.warn('Dữ liệu API Macbook theo ID không hợp lệ:', data);
      return null;
    }

    return data.macbook;
  } catch (error) {
    console.error('Lỗi khi lấy macbook:', error);
    return null;
  }
}
