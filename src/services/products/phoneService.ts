import { logCacheStatus } from '@/utils/logCacheStatus';
import { getServerApiUrl } from '../../../hooks/useApiUrl';
import { IPhone } from '@/types/type/products/phone/phone';

export async function getAllmostViewedPhones(): Promise<IPhone[]> {
  try {
    const apiUrl = `${getServerApiUrl('/api/phones/most-viewed')}`;
    const res = await fetch(apiUrl, {
      cache: 'force-cache',
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);

    const data = await res.json();
    // console.log('Phone API response:', data); // Debug response

    if (!data || typeof data !== 'object' || !Array.isArray(data.phones)) {
      console.warn('Dữ liệu API Phone không hợp lệ:', data);
      return [];
    }

    return data.phones;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách phones:', error);
    return [];
  }
}

export async function getPhonesByStatus(status?: number): Promise<IPhone[]> {
  try {
    const query = typeof status === 'number' ? `?status=${status}` : '';
    const apiUrl = getServerApiUrl(`/api/phones${query}`);
    const res = await fetch(apiUrl, {
      cache: 'force-cache',
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);

    const data = await res.json();
    // console.log('Phone API response:', data); // Debug response

    if (!data || typeof data !== 'object' || !Array.isArray(data.phones)) {
      console.warn('Dữ liệu API Phone không hợp lệ:', data);
      return [];
    }

    return data.phones;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách phones:', error);
    return [];
  }
}
export async function getAllPhones(): Promise<IPhone[]> {
  return getPhonesByStatus();
}
export async function getAllNewPhones(): Promise<IPhone[]> {
  return getPhonesByStatus(0);
}

export async function getAllUsedPhones(): Promise<IPhone[]> {
  return getPhonesByStatus(1);
}

export async function getPhoneById(id: string): Promise<IPhone | null> {
  try {
    const apiUrl = getServerApiUrl(`/api/phone/${id}`);
    const res = await fetch(apiUrl, {
      cache: 'force-cache',
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Lỗi API: ${res.status} ${res.statusText} - ${errorText}`);
    }

    // Kiểm tra trạng thái cache
    logCacheStatus(res, `phones:${id}`);
    const data = await res.json();

    if (!data || typeof data !== 'object' || !data.phone) {
      console.warn('Dữ liệu API Phone theo ID không hợp lệ:', data);
      return null;
    }

    return data.phone;
  } catch (error) {
    console.error('Lỗi khi lấy phone:', error);
    return null;
  }
}
