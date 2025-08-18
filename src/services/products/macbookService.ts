import { logCacheStatus } from '@/utils/logCacheStatus';
import { getServerApiUrl } from '../../../hooks/useApiUrl';
import { GroupedMacbook, IMacbook } from '../../types/type/products/macbook/macbook';

type CacheEntryMacbook = {
  data: GroupedMacbook[];
  timestamp: number;
};

// Cache server-side riêng cho Macbook
const macbookCache: Record<string, CacheEntryMacbook> = {};

const MACBOOK_CACHE_CLEANUP_INTERVAL = 60_000; // 1 phút
const MACBOOK_CACHE_MAX_AGE = 5 * 60_000; // 5 phút

if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const key in macbookCache) {
      if (now - macbookCache[key].timestamp > MACBOOK_CACHE_MAX_AGE) {
        delete macbookCache[key];
      }
    }
  }, MACBOOK_CACHE_CLEANUP_INTERVAL);
}

export async function getNewGroupedMacbook(name?: string): Promise<GroupedMacbook[]> {
  try {
    const searchParams = new URLSearchParams();
    searchParams.set('status', '0');
    if (name) searchParams.set('name', name);

    const apiUrl = `${getServerApiUrl(`/api/grouped-laptop-macbook?${searchParams.toString()}`)}`;
    const cacheKey = apiUrl;
    const now = Date.now();

    // Kiểm tra cache 60s
    const cached = macbookCache[cacheKey];
    if (cached && now - cached.timestamp < 60_000) {
      return cached.data;
    }

    // Fetch API mới
    const res = await fetch(apiUrl, { next: { revalidate: 60 } });

    if (!res.ok) throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);

    const data = await res.json();
    if (!data || typeof data !== 'object' || !Array.isArray(data.groupedMacbook)) {
      console.warn('Dữ liệu groupedMacbook không hợp lệ:', data);
      return cached?.data || [];
    }

    // Lưu cache mới
    macbookCache[cacheKey] = { data: data.groupedMacbook, timestamp: now };

    return data.groupedMacbook;
  } catch (error) {
    console.error('Lỗi khi gọi API groupedMacbook:', error);

    // Fallback cache nếu API lỗi
    const fallbackCache = macbookCache[`${getServerApiUrl(`/api/grouped-laptop-macbook?status=0${name ? `&name=${name}` : ''}`)}`];
    return fallbackCache?.data || [];
  }
}

export async function getMacbookByCatalogId(catalogID: string): Promise<IMacbook[]> {
  try {
    const query = `?catalogID=${catalogID}`;
    const apiUrl = getServerApiUrl(`/api/laptop-macbook${query}`);
    const res = await fetch(apiUrl, {
      cache: 'force-cache',
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);

    const data = await res.json();

    if (!data || typeof data !== 'object' || !Array.isArray(data.macbook)) {
      console.warn('Dữ liệu API Macbook không hợp lệ:', data);
      return [];
    }

    return data.macbook;
  } catch (error) {
    console.error('Lỗi khi lấy sản phẩm theo danh mục:', error);
    return [];
  }
}

export async function getMacbookByStatus(status?: number): Promise<IMacbook[]> {
  try {
    const query = typeof status === 'number' ? `?status=${status}` : '';
    const apiUrl = `${getServerApiUrl(`/api/laptop-macbook${query}`)}`;
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

export async function getAllMacbook(): Promise<IMacbook[]> {
  return getMacbookByStatus();
}

export async function getAllNewMacbook(): Promise<IMacbook[]> {
  return getMacbookByStatus(0);
}

export async function getAllUsedMacbook(): Promise<IMacbook[]> {
  return getMacbookByStatus(1);
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
