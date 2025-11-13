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
    const res = await fetch(apiUrl, { cache: 'no-store' });

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

// Cache server-side theo URL
type MacbookCacheEntry = { data: IMacbook; timestamp: number };
const macbookCacheById: Record<string, MacbookCacheEntry> = {};
const CACHE_TTL = 60_000; // 1 phút

export async function getMacbookById(id: string): Promise<IMacbook | null> {
  const apiUrl = getServerApiUrl(`/api/macbook/${id}`);

  const now = Date.now();
  // Check cache
  const cached = macbookCacheById[apiUrl];
  if (cached && now - cached.timestamp < CACHE_TTL) {
    console.log('Cache hit for macbook ID:', id);
    return cached.data;
  }

  try {
    console.log('Fetching macbook detail:', apiUrl);
    const res = await fetch(apiUrl, { cache: 'no-store' });

    // Log cache header
    logCacheStatus(res, `macbook:${id}`);

    if (!res.ok) throw new Error(`Fetch macbook lỗi: ${res.status} ${res.statusText}`);

    const data = await res.json();
    if (!data || !data.macbook) return null;

    // Lưu cache
    macbookCacheById[apiUrl] = { data: data.macbook, timestamp: now };
    console.log('Cache saved for macbook ID:', id);

    return data.macbook;
  } catch (error) {
    console.error('Lỗi tải macbook:', error);
    return cached?.data ?? null; // fallback dùng cache nếu có
  }
}

// Hàm log snapshot cache
export function logMacbookCache() {
  // console.log('[Macbook Cache Snapshot]:', macbookCacheById);
}

// Hàm clear cache
export function invalidateMacbookCache() {
  for (const key in macbookCacheById) delete macbookCacheById[key];
  console.log('Macbook cache cleared');
}
