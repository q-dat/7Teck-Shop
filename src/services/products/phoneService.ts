import { getServerApiUrl } from '../../../hooks/useApiUrl';
import { GroupedPhone, IPhone } from '@/types/type/products/phone/phone';

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
export async function getNewGroupedPhones(name?: string): Promise<GroupedPhone[]> {
  try {
    // --- Tạo query params ---
    const searchParams = new URLSearchParams();
    searchParams.set('status', '0');
    if (name) searchParams.set('name', name);

    const apiUrl = `${getServerApiUrl(`/api/grouped-phones?${searchParams}`)}`;
    const cacheKey = apiUrl; // cache riêng cho từng URL

    const now = Date.now();

    // --- Kiểm tra cache còn hiệu lực 60s ---
    const cached = cache[cacheKey];
    if (cached && now - cached.timestamp < 60_000) {
      return cached.data;
    }

    // --- Fetch mới từ API, kết hợp Next.js ISR ---
    const res = await fetch(apiUrl, { next: { revalidate: 60 } });

    if (!res.ok) throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);

    const data = await res.json();

    // --- Kiểm tra dữ liệu hợp lệ ---
    if (!data || typeof data !== 'object' || !Array.isArray(data.groupedPhones)) {
      console.warn('Dữ liệu groupedPhones không hợp lệ:', data);
      return cached?.data || [];
    }

    // --- Lưu cache mới ---
    cache[cacheKey] = { data: data.groupedPhones, timestamp: now };

    return data.groupedPhones;
  } catch (error) {
    console.error('Lỗi khi gọi API groupedPhones:', error);

    // --- Fallback dùng cache nếu có ---
    const fallbackCache = cache[`${getServerApiUrl(`/api/grouped-phones?status=0${name ? `&name=${name}` : ''}`)}`];
    return fallbackCache?.data || [];
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
