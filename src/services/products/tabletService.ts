import { logCacheStatus } from '@/utils/logCacheStatus';
import { getServerApiUrl } from '../../../hooks/useApiUrl';
import { GroupedTablet, ITablet } from '@/types/type/products/tablet/tablet';

type CacheEntryTablet = {
  data: GroupedTablet[];
  timestamp: number;
};

const tabletCache: Record<string, CacheEntryTablet> = {};

const TABLET_CACHE_CLEANUP_INTERVAL = 60_000; // 1 phút
const TABLET_CACHE_MAX_AGE = 5 * 60_000; // 5 phút

if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const key in tabletCache) {
      if (now - tabletCache[key].timestamp > TABLET_CACHE_MAX_AGE) {
        delete tabletCache[key];
      }
    }
  }, TABLET_CACHE_CLEANUP_INTERVAL);
}

export async function getNewGroupedTablets(name?: string): Promise<GroupedTablet[]> {
  try {
    const searchParams = new URLSearchParams();
    searchParams.set('status', '0');
    if (name) searchParams.set('name', name);

    const apiUrl = `${getServerApiUrl(`/api/grouped-tablets?${searchParams.toString()}`)}`;
    const cacheKey = apiUrl;

    const now = Date.now();

    // Kiểm tra cache 60s
    const cached = tabletCache[cacheKey];
    if (cached && now - cached.timestamp < 60_000) {
      return cached.data;
    }

    // Fetch API mới
    const res = await fetch(apiUrl, { next: { revalidate: 60 } });

    if (!res.ok) throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);

    const data = await res.json();
    if (!data || typeof data !== 'object' || !Array.isArray(data.groupedTablets)) {
      console.warn('Dữ liệu groupedTablets không hợp lệ:', data);
      return cached?.data || [];
    }

    // Lưu cache mới
    tabletCache[cacheKey] = { data: data.groupedTablets, timestamp: now };

    return data.groupedTablets;
  } catch (error) {
    console.error('Lỗi khi gọi API groupedTablets:', error);

    // Fallback cache
    const fallbackCache = tabletCache[`${getServerApiUrl(`/api/grouped-tablets?status=0${name ? `&name=${name}` : ''}`)}`];
    return fallbackCache?.data || [];
  }
}

export async function getTabletsByCatalogId(catalogID: string): Promise<ITablet[]> {
  try {
    const query = `?catalogID=${catalogID}`;
    const apiUrl = getServerApiUrl(`/api/tablets${query}`);
    const res = await fetch(apiUrl, { cache: 'no-store' });

    if (!res.ok) throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);

    const data = await res.json();

    if (!data || typeof data !== 'object' || !Array.isArray(data.tablets)) {
      console.warn('Dữ liệu API Ttablets không hợp lệ:', data);
      return [];
    }

    return data.tablets;
  } catch (error) {
    console.error('Lỗi khi lấy sản phẩm theo danh mục:', error);
    return [];
  }
}

export async function getTabletsByStatus(status?: number): Promise<ITablet[]> {
  try {
    const query = typeof status === 'number' ? `?status=${status}` : '';
    const apiUrl = `${getServerApiUrl(`/api/tablets${query}`)}`;
    const res = await fetch(apiUrl, {
      cache: 'force-cache',
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);

    const data = await res.json();
    // console.log('Tablet API response:', data); // Debug response

    if (!data || typeof data !== 'object' || !Array.isArray(data.tablets)) {
      console.warn('Dữ liệu API Tablet không hợp lệ:', data);
      return [];
    }

    return data.tablets;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách tablet:', error);
    return [];
  }
}

export async function getAllTablets(): Promise<ITablet[]> {
  return getTabletsByStatus();
}

export async function getAllNewTablets(): Promise<ITablet[]> {
  return getTabletsByStatus(0);
}

export async function getAllUsedTablets(): Promise<ITablet[]> {
  return getTabletsByStatus(1);
}

// Cache server-side theo URL
type TabletCacheEntry = { data: ITablet; timestamp: number };
const tabletCacheById: Record<string, TabletCacheEntry> = {};
const CACHE_TTL = 60_000; // 1 phút

export async function getTabletById(id: string): Promise<ITablet | null> {
  const apiUrl = getServerApiUrl(`/api/tablet/${id}`);

  const now = Date.now();
  // Check cache
  const cached = tabletCacheById[apiUrl];
  if (cached && now - cached.timestamp < CACHE_TTL) {
    console.log('Cache hit for tablet ID:', id);
    return cached.data;
  }

  try {
    console.log('Fetching tablet detail:', apiUrl);
    const res = await fetch(apiUrl, { cache: 'no-store' });

    // Log cache header
    logCacheStatus(res, `tablets:${id}`);

    if (!res.ok) throw new Error(`Fetch tablet lỗi: ${res.status} ${res.statusText}`);

    const data = await res.json();
    if (!data || !data.tablet) return null;

    // Lưu cache
    tabletCacheById[apiUrl] = { data: data.tablet, timestamp: now };
    console.log('Cache saved for tablet ID:', id);

    return data.tablet;
  } catch (error) {
    console.error('Lỗi tải tablet:', error);
    return cached?.data ?? null; // fallback dùng cache nếu có
  }
}

// Hàm log snapshot cache
export function logTabletCache() {
  // console.log('[Tablet Cache Snapshot]:', tabletCacheById);
}

// Hàm clear cache
export function invalidateTabletCache() {
  for (const key in tabletCacheById) delete tabletCacheById[key];
  console.log('Tablet cache cleared');
}
