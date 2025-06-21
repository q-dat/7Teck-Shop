import { getServerApiUrl } from '../../../hooks/useApiUrl';
import { IPhone } from '../../types/type/phone/phone';

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

export async function getAllPhones(): Promise<IPhone[]> {
  try {
    const apiUrl = `${getServerApiUrl('/api/phones')}`;
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

    const data = await res.json();
    if (res.headers.get('x-vercel-cache') === 'HIT') {
      console.log(`Cache hit for phone:${id}`);
    }

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
