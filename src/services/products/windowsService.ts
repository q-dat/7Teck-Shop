import { IWindows } from '@/types/type/windows/windows';
import { getServerApiUrl } from '../../../hooks/useApiUrl';

export async function getAllWindows(): Promise<IWindows[]> {
  try {
    const apiUrl = `${getServerApiUrl('/api/laptop-windows')}`;
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

export async function getWindowsById(id: string): Promise<IWindows | null> {
  try {
    const apiUrl = getServerApiUrl(`/api/windows/${id}`);
    const res = await fetch(apiUrl, {
      cache: 'force-cache',
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);

    const data = await res.json();
    // console.log('Windows by ID API response:', data); // Debug response

    if (!data || typeof data !== 'object' || !data.window) {
      console.warn('Dữ liệu API Windows theo ID không hợp lệ:', data);
      return null;
    }

    return data.window;
  } catch (error) {
    console.error('Lỗi khi lấy windows:', error);
    return null;
  }
}
