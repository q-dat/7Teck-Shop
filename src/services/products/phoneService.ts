import { getServerApiUrl } from '../../../hooks/useApiUrl';
import { GroupedPhone, IPhone, PhoneFilterParams } from '@/types/type/products/phone/phone';
import { getWithFallback } from '../shared/getWithFallback';

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

/**
 * Hàm fetch grouped phones với cache thông minh
 * - Cache riêng cho từng `name`
 * - Cache tạm thời 60s, kết hợp Next.js ISR
 * - Cleanup cache cũ > 5 phút để tránh memory leak
 * - Fallback dùng cache nếu API lỗi
 */

type CacheEntry = {
  data: GroupedPhone[];
  timestamp: number;
};

// Cache server-side, key là URL đầy đủ
const cache: Record<string, CacheEntry> = {};

// --- Cleanup cache cũ (>5 phút) mỗi 1 phút ---
const CACHE_CLEANUP_INTERVAL = 60_000; // 1 phút
const CACHE_MAX_AGE = 5 * 60_000; // 5 phút

if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const key in cache) {
      if (now - cache[key].timestamp > CACHE_MAX_AGE) {
        delete cache[key];
      }
    }
  }, CACHE_CLEANUP_INTERVAL);
}

/**
 * Lấy danh sách grouped phones từ API với cache
 * @param name Tên filter (optional)
 */
export async function getNewGroupedPhones(filters?: PhoneFilterParams): Promise<GroupedPhone[]> {
  try {
    const searchParams = new URLSearchParams();

    searchParams.set('status', '0');

    if (filters?.name) searchParams.set('name', filters.name);
    if (filters?.minPrice) searchParams.set('minPrice', filters.minPrice);
    if (filters?.maxPrice) searchParams.set('maxPrice', filters.maxPrice);
    if (filters?.color) searchParams.set('color', filters.color);
    if (filters?.ram) searchParams.set('ram', filters.ram);
    if (filters?.storage) searchParams.set('storage', filters.storage);
    if (filters?.sort) searchParams.set('sort', filters.sort);

    const apiUrl = getServerApiUrl(`/api/grouped-phones?${searchParams.toString()}`);

    const hasDynamicFilter = filters && (filters.minPrice || filters.maxPrice || filters.color || filters.ram || filters.storage || filters.sort);

    const res = await fetch(apiUrl, {
      cache: hasDynamicFilter ? 'no-store' : 'force-cache',
      next: hasDynamicFilter ? undefined : { revalidate: 60 },
    });

    if (!res.ok) throw new Error();

    const data = await res.json();

    return data.groupedPhones ?? [];
  } catch {
    return [];
  }
}

export async function getPhonesByCatalogId(catalogID: string): Promise<IPhone[]> {
  try {
    const query = `?catalogID=${catalogID}`;
    const apiUrl = getServerApiUrl(`/api/phones${query}`);
    const res = await fetch(apiUrl, { cache: 'no-store' });

    if (!res.ok) throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);

    const data = await res.json();

    if (!data || typeof data !== 'object' || !Array.isArray(data.phones)) {
      console.warn('Dữ liệu API Phone không hợp lệ:', data);
      return [];
    }

    return data.phones;
  } catch (error) {
    console.error('Lỗi khi lấy sản phẩm theo danh mục:', error);
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
  const apiUrl = getServerApiUrl(`/api/phone/${id}`);

  const res = await fetch(apiUrl, {
    // Không được dùng cache: "no-store"
    // Để Next.js tự cache theo revalidate của page
    // next: { revalidate: 18000 }, // chỉ dùng nếu muốn override tại đây
  });

  if (!res.ok) return null;

  const data = await res.json();
  return data?.phone ?? null;
}

export async function getPhoneWithFallback(id: string): Promise<IPhone | null> {
  return getWithFallback<IPhone>(id, getAllPhones, getPhoneById);
}
