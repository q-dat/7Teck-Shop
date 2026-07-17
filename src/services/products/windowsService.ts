import { getServerApiUrl } from '../../../hooks/useApiUrl';
import { GroupedWindows, IWindows } from '@/types/type/products/windows/windows';
import { getWithFallback } from '../shared/getWithFallback';

type CacheEntryWindows = {
  data: GroupedWindows[];
  timestamp: number;
};

const windowsCache: Record<string, CacheEntryWindows> = {};

const WINDOWS_CACHE_CLEANUP_INTERVAL = 60_000;
const WINDOWS_CACHE_MAX_AGE = 5 * 60_000;

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

export async function getGroupedWindows(name?: string): Promise<GroupedWindows[]> {
  try {
    const searchParams = new URLSearchParams();

    searchParams.set('w_cat_status', '1');

    if (name) {
      searchParams.set('name', name);
    }

    const apiUrl = getServerApiUrl(`/api/grouped-laptop-windows?${searchParams.toString()}`);
    const cacheKey = apiUrl;
    const now = Date.now();

    const cached = windowsCache[cacheKey];

    if (cached && now - cached.timestamp < 60_000) {
      return cached.data;
    }

    const res = await fetch(apiUrl, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();

    if (!data || typeof data !== 'object' || !Array.isArray(data.groupedWindows)) {
      console.warn('Dữ liệu groupedWindows không hợp lệ:', data);
      return cached?.data || [];
    }

    windowsCache[cacheKey] = {
      data: data.groupedWindows,
      timestamp: now,
    };

    return data.groupedWindows;
  } catch (error) {
    console.error('Lỗi khi gọi API groupedWindows:', error);

    const fallbackParams = new URLSearchParams();
    fallbackParams.set('w_cat_status', '0');

    if (name) {
      fallbackParams.set('name', name);
    }

    const fallbackKey = getServerApiUrl(`/api/grouped-laptop-windows?${fallbackParams.toString()}`);
    const fallbackCache = windowsCache[fallbackKey];

    return fallbackCache?.data || [];
  }
}

export async function getWindowsByCatalogId(catalogID: string): Promise<IWindows[]> {
  try {
    if (!catalogID) {
      return [];
    }

    const searchParams = new URLSearchParams();
    searchParams.set('catalogID', catalogID);

    const apiUrl = getServerApiUrl(`/api/laptop-windows?${searchParams.toString()}`);

    const res = await fetch(apiUrl, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();

    if (!data || typeof data !== 'object' || !Array.isArray(data.windows)) {
      console.warn('Dữ liệu API Windows không hợp lệ:', data);
      return [];
    }

    return data.windows;
  } catch (error) {
    console.error('Lỗi khi lấy sản phẩm Windows theo danh mục:', error);
    return [];
  }
}

export async function getWindowsByCatalogStatus(wCatStatus?: number): Promise<IWindows[]> {
  try {
    const searchParams = new URLSearchParams();

    if (typeof wCatStatus === 'number') {
      searchParams.set('w_cat_status', String(wCatStatus));
    }

    const query = searchParams.toString();
    const apiUrl = getServerApiUrl(`/api/laptop-windows${query ? `?${query}` : ''}`);

    const res = await fetch(apiUrl, {
      cache: 'force-cache',
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();

    if (!data || typeof data !== 'object' || !Array.isArray(data.windows)) {
      console.warn('Dữ liệu API Windows không hợp lệ:', data);
      return [];
    }

    return data.windows;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách Windows:', error);
    return [];
  }
}

export async function getAllWindows(): Promise<IWindows[]> {
  return getWindowsByCatalogStatus();
}

export async function getAllNewWindows(): Promise<IWindows[]> {
  return getWindowsByCatalogStatus(0);
}

export async function getAllUsedWindows(): Promise<IWindows[]> {
  return getWindowsByCatalogStatus(1);
}

export async function getWindowsById(id: string): Promise<IWindows | null> {
  try {
    if (!id) {
      return null;
    }

    const apiUrl = getServerApiUrl(`/api/windows/${id}`);

    const res = await fetch(apiUrl);

    if (!res.ok) {
      return null;
    }

    const data = await res.json();

    return data?.windows ?? null;
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết Windows:', error);
    return null;
  }
}

export async function getWindowsWithFallback(id: string): Promise<IWindows | null> {
  return getWithFallback<IWindows>(id, getAllWindows, getWindowsById);
}

export async function getWindowsBySlug(slug: string): Promise<IWindows | null> {
  try {
    if (!slug) return null;

    const normalizedSlug = slug.trim().toLowerCase();

    const apiUrl = getServerApiUrl(`/api/windows/slug/${normalizedSlug}`);

    const res = await fetch(apiUrl, {
      // next: { revalidate: 300 },
    });

    if (!res.ok) return null;

    const data = await res.json();

    if (!data || typeof data !== 'object' || !data.windows) {
      console.warn('Dữ liệu API Windows slug không hợp lệ:', data);
      return null;
    }

    return data.windows;
  } catch (error) {
    console.error('Lỗi khi lấy windows theo slug:', error);
    return null;
  }
}
