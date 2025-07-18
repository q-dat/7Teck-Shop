import { IWindowsCatalog } from '@/types/type/catalogs/windows-catalog/windows-catalog';
import { getServerApiUrl } from '../../../hooks/useApiUrl';

export async function getAllUsedWindowsCatalogs(): Promise<IWindowsCatalog[]> {
  try {
    const apiUrl = `${getServerApiUrl('/api/windows-catalogs?status=1&hasProduct=true')}`;
    const res = await fetch(apiUrl, {
      cache: 'force-cache',
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);

    const data = await res.json();
    // console.log('Windows API response:', data); // Debug response

    if (!data || typeof data !== 'object' || !Array.isArray(data.windowsCatalogs)) {
      console.warn('Dữ liệu API Windows không hợp lệ:', data);
      return [];
    }

    return data.windowsCatalogs;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách Windows:', error);
    return [];
  }
}

export async function getWindowsCatalogById(id: string): Promise<IWindowsCatalog | null> {
  try {
    const apiUrl = getServerApiUrl(`/api/windows-catalogs/${id}`);
    const res = await fetch(apiUrl, {
      cache: 'force-cache',
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);

    const data = await res.json();
    // console.log('Windows by ID API response:', data); // Debug response

    if (!data || typeof data !== 'object' || !data.windowsCatalog) {
      console.warn('Dữ liệu API Windows theo ID không hợp lệ:', data);
      return null;
    }

    return data.windowsCatalog;
  } catch (error) {
    console.error('Lỗi khi lấy Windows:', error);
    return null;
  }
}
