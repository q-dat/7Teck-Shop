import { IPriceListApi, IProductVariant } from '@/types/type/price-list/price-list';
import { getServerApiUrl } from '../../hooks/useApiUrl';

export async function getAllPriceLists(): Promise<{ priceLists: IPriceListApi[] }> {
  try {
    const apiUrl = getServerApiUrl('/api/price-lists');
    const res = await fetch(apiUrl, { cache: 'force-cache', next: { revalidate: 60 } });

    if (!res.ok) throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);

    const data = await res.json();
    if (!data || !Array.isArray(data.priceLists)) return { priceLists: [] };

    return data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách PriceList:', error);
    return { priceLists: [] };
  }
}

export async function getPriceListById(id: string): Promise<IProductVariant | null> {
  try {
    const apiUrl = getServerApiUrl(`/api/price-list/${id}`);
    const res = await fetch(apiUrl, {
      cache: 'force-cache',
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error(`Lỗi API: ${res.status} ${res.statusText}`);

    const data = await res.json();
    // console.log('PriceList by ID API response:', data); // Debug response

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
