import { ITabletCatalog } from '@/types/type/tablet-catalog/tablet-catalog';
import { getServerApiUrl } from '../../../hooks/useApiUrl';

export async function getAllTabletCatalogs(): Promise<ITabletCatalog[]> {
  try {
    const apiUrl = `${getServerApiUrl('/api/tablet-catalogs')}`;
    const res = await fetch(apiUrl, {
      cache: 'force-cache',
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);

    const data = await res.json();
    // console.log('Tablet API response:', data); // Debug response

    if (!data || typeof data !== 'object' || !Array.isArray(data.tabletCatalogs)) {
      console.warn('Dữ liệu API Tablet không hợp lệ:', data);
      return [];
    }

    return data.tabletCatalogs;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách Tablet:', error);
    return [];
  }
}

export async function getTabletCatalogById(id: string): Promise<ITabletCatalog | null> {
  try {
    const apiUrl = getServerApiUrl(`/api/tablet-catalogs/${id}`);
    const res = await fetch(apiUrl, {
      cache: 'force-cache',
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);

    const data = await res.json();
    // console.log('Tablet by ID API response:', data); // Debug response

    if (!data || typeof data !== 'object' || !data.tabletCatalog) {
      console.warn('Dữ liệu API Tablet theo ID không hợp lệ:', data);
      return null;
    }

    return data.tabletCatalog;
  } catch (error) {
    console.error('Lỗi khi lấy Tablet:', error);
    return null;
  }
}
