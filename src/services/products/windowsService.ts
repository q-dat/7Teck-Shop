import { getServerApiUrl } from '../../../hooks/useApiUrl';
import { logCacheStatus } from '@/utils/logCacheStatus';
import { GroupedWindows, IWindows } from '@/types/type/products/windows/windows';

type CacheEntryWindows = {
  data: GroupedWindows[];
  timestamp: number;
};

// Cache server-side riêng cho Windows
const windowsCache: Record<string, CacheEntryWindows> = {};

const WINDOWS_CACHE_CLEANUP_INTERVAL = 60_000; // 1 phút
const WINDOWS_CACHE_MAX_AGE = 5 * 60_000; // 5 phút

if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const key in windowsCache) {
      if (now - windowsCache[key].timestamp > WINDOWS_CACHE_MAX_AGE) {
        delete windowsCache[key];
      }
    }
  }, WINDOWS_CACHE_CLEANUP_INTERVAL);
}

export async function getNewGroupedWindows(name?: string): Promise<GroupedWindows[]> {
  try {
    const searchParams = new URLSearchParams();
    searchParams.set('status', '0');
    if (name) searchParams.set('name', name);

    const apiUrl = `${getServerApiUrl(`/api/grouped-laptop-windows?${searchParams.toString()}`)}`;
    const cacheKey = apiUrl;
    const now = Date.now();

    // Kiểm tra cache 60s
    const cached = windowsCache[cacheKey];
    if (cached && now - cached.timestamp < 60_000) {
      return cached.data;
    }

    // Fetch API mới
    const res = await fetch(apiUrl, { next: { revalidate: 60 } });

    if (!res.ok) throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);

    const data = await res.json();
    if (!data || typeof data !== 'object' || !Array.isArray(data.groupedWindows)) {
      console.warn('Dữ liệu groupedWindows không hợp lệ:', data);
      return cached?.data || [];
    }

    // Lưu cache mới
    windowsCache[cacheKey] = { data: data.groupedWindows, timestamp: now };

    return data.groupedWindows;
  } catch (error) {
    console.error('Lỗi khi gọi API groupedWindows:', error);

    // Fallback cache nếu API lỗi
    const fallbackCache = windowsCache[`${getServerApiUrl(`/api/grouped-laptop-windows?status=0${name ? `&name=${name}` : ''}`)}`];
    return fallbackCache?.data || [];
  }
}

export async function getWindowsByCatalogId(catalogID: string): Promise<IWindows[]> {
  try {
    const query = `?catalogID=${catalogID}`;
    const apiUrl = getServerApiUrl(`/api/laptop-windows${query}`);
    const res = await fetch(apiUrl, {
      cache: 'force-cache',
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);

    const data = await res.json();

    if (!data || typeof data !== 'object' || !Array.isArray(data.windows)) {
      console.warn('Dữ liệu API Windows không hợp lệ:', data);
      return [];
    }

    return data.windows;
  } catch (error) {
    console.error('Lỗi khi lấy sản phẩm theo danh mục:', error);
    return [];
  }
}

export async function getWindowsByStatus(status?: number): Promise<IWindows[]> {
  try {
    const query = typeof status === 'number' ? `?status=${status}` : '';
    const apiUrl = `${getServerApiUrl(`/api/laptop-windows${query}`)}`;
    const res = await fetch(apiUrl, {
      cache: 'force-cache',
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);

    const data = await res.json();
    // console.log('Windows API response:', data); // Debug response

    if (!data || typeof data !== 'object' || !Array.isArray(data.windows)) {
      console.warn('Dữ liệu API Windows không hợp lệ:', data);
      return [];
    }

    return data.windows;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách windows:', error);
    return [];
  }
}

export async function getAllWindows(): Promise<IWindows[]> {
  return getWindowsByStatus();
}

export async function getAllNewWindows(): Promise<IWindows[]> {
  return getWindowsByStatus(0);
}

export async function getAllUsedWindows(): Promise<IWindows[]> {
  return getWindowsByStatus(1);
}

export async function getWindowsById(id: string): Promise<IWindows | null> {
  try {
    const apiUrl = getServerApiUrl(`/api/windows/${id}`);
    const res = await fetch(apiUrl, {
      cache: 'force-cache',
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Lỗi API: ${res.status} ${res.statusText} - ${errorText}`);
    }
    // Kiểm tra trạng thái cache
    logCacheStatus(res, `windows:${id}`);
    const data = await res.json();

    if (!data || typeof data !== 'object' || !data.windows) {
      console.warn('Dữ liệu API Windows theo ID không hợp lệ:', data);
      return null;
    }

    return data.windows;
  } catch (error) {
    console.error('Lỗi khi lấy windows:', error);
    return null;
  }
}
