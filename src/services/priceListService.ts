import { IPriceListApi } from '@/types/type/price-list/price-list';
import { getServerApiUrl } from '../../hooks/useApiUrl';

// Gọi API riêng của 7Teck-Shop (src/app/api/price-lists), route này đọc từ
// MongoDB cục bộ của shop (cùng cơ chế với phoneService). BE 7teck chỉ là nguồn seed.
export async function getAllPriceLists(): Promise<{ priceLists: IPriceListApi[] }> {
  try {
    const apiUrl = `${getServerApiUrl('/api/price-lists')}`;
    const res = await fetch(apiUrl, {
      cache: 'no-store',
    });

    if (!res.ok) throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);

    const data = await res.json();

    if (!data || typeof data !== 'object' || !Array.isArray(data.priceLists)) {
      console.warn('Dữ liệu API PriceList không hợp lệ:', data);
      return { priceLists: [] };
    }

    return data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách PriceList:', error);
    return { priceLists: [] };
  }
}

export async function getPriceListById(id: string): Promise<IPriceListApi | null> {
  try {
    const apiUrl = getServerApiUrl(`/api/price-list/${id}`);
    const res = await fetch(apiUrl, {
      cache: 'no-store',
    });

    if (!res.ok) throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);

    const data = await res.json();

    if (!data || typeof data !== 'object' || !data.priceList) {
      console.warn('Dữ liệu API PriceList theo ID không hợp lệ:', data);
      return null;
    }

    return data.priceList;
  } catch (error) {
    console.error('Lỗi khi lấy PriceList:', error);
    return null;
  }
}
