import { IPriceListApi, IProductVariant } from '@/types/type/price-list/price-list';
import { fetchWithBackendFallback } from '@/lib/server/fetchWithBackendFallback';

// Gọi trực tiếp API nguyên bản từ backend 7teck (NEXT_PUBLIC_API_BASE_URL),
// bỏ hoàn toàn logic proxy localhost cũ. Dùng fetchWithBackendFallback để có
// fallback an toàn khi BE không khả dụng (trả về mảng rỗng thay vì throw).
const PRICE_LISTS_PATH = '/api/price-lists';
const PRICE_LIST_PATH = '/api/price-list';

export async function getAllPriceLists(): Promise<{ priceLists: IPriceListApi[] }> {
  try {
    const data = await fetchWithBackendFallback<{ priceLists: IPriceListApi[] }>({
      backendPath: PRICE_LISTS_PATH,
      fallback: async () => ({ priceLists: [] }),
    });

    if (!data || !Array.isArray(data.priceLists)) return { priceLists: [] };

    return data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách PriceList:', error);
    return { priceLists: [] };
  }
}

export async function getPriceListById(id: string): Promise<IProductVariant | null> {
  try {
    const data = await fetchWithBackendFallback<{ priceList: IProductVariant }>({
      backendPath: `${PRICE_LIST_PATH}/${id}`,
      fallback: async () => ({ priceList: null as unknown as IProductVariant }),
    });

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
