import { IMacbookCatalog } from '@/types/type/catalogs/macbook-catalog/macbook-catalog';
import { getServerApiUrl } from '../../../hooks/useApiUrl';

export async function getAllUsedMacbookCatalogs(): Promise<IMacbookCatalog[]> {
  try {
    const apiUrl = `${getServerApiUrl('/api/macbook-catalogs?status=1&hasProduct=true')}`;
    const res = await fetch(apiUrl, {
      cache: 'force-cache',
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);

    const data = await res.json();
    // console.log('Macbook API response:', data); // Debug response

    if (!data || typeof data !== 'object' || !Array.isArray(data.macbookCatalogs)) {
      console.warn('Dữ liệu API Macbook không hợp lệ:', data);
      return [];
    }

    return data.macbookCatalogs;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách Macbook:', error);
    return [];
  }
}

export async function getMacbookCatalogById(id: string): Promise<IMacbookCatalog | null> {
  try {
    const apiUrl = getServerApiUrl(`/api/macbook-catalogs/${id}`);
    const res = await fetch(apiUrl, {
      cache: 'force-cache',
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);

    const data = await res.json();
    // console.log('Macbook by ID API response:', data); // Debug response

    if (!data || typeof data !== 'object' || !data.macbookCatalog) {
      console.warn('Dữ liệu API Macbook theo ID không hợp lệ:', data);
      return null;
    }

    return data.macbookCatalog;
  } catch (error) {
    console.error('Lỗi khi lấy Macbook:', error);
    return null;
  }
}
