import { IPhoneCatalog } from '@/types/type/phone-catalog/phone-catalog';
import { getServerApiUrl } from '../../../hooks/useApiUrl';

export async function getAllPhoneCatalogs(): Promise<IPhoneCatalog[]> {
  try {
    const apiUrl = `${getServerApiUrl('/api/phone-catalogs')}`;
    const res = await fetch(apiUrl, {
      cache: 'force-cache',
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);

    const data = await res.json();
    // console.log('Phone API response:', data); // Debug response

    if (!data || typeof data !== 'object' || !Array.isArray(data.phoneCatalogs)) {
      console.warn('Dữ liệu API Phone không hợp lệ:', data);
      return [];
    }

    return data.phoneCatalogs;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách Phone:', error);
    return [];
  }
}

export async function getPhoneCatalogById(id: string): Promise<IPhoneCatalog | null> {
  try {
    const apiUrl = getServerApiUrl(`/api/phone-catalogs/${id}`);
    const res = await fetch(apiUrl, {
      cache: 'force-cache',
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);

    const data = await res.json();
    // console.log('Phone by ID API response:', data); // Debug response

    if (!data || typeof data !== 'object' || !data.phoneCatalog) {
      console.warn('Dữ liệu API Phone theo ID không hợp lệ:', data);
      return null;
    }

    return data.phoneCatalog;
  } catch (error) {
    console.error('Lỗi khi lấy Phone:', error);
    return null;
  }
}
