import { ProductBase } from '@/components/userPage/page/(san-pham)/ClientProductPage';
import ClientUsedProductByCatalogPage from '@/components/userPage/page/(thiet-bi-da-qua-su-dung)/ClientUsedProductByCatalogPage';
import { getWindowsByCatalogId } from '@/services/products/windowsService';
import { buildPageMetadata } from '@/app/(SEO)/lib/seo';

export const metadata = buildPageMetadata({
  path: '/thiet-bi-da-qua-su-dung/windows',
  title: 'Laptop Windows đã qua sử dụng giá tốt | 7Teck.vn',
  description:
    'Danh sách laptop Windows đã qua sử dụng, chất lượng kiểm định, giá tốt tại 7Teck.vn. Bảo hành uy tín, giao hàng toàn quốc.',
  keywords: ['laptop Windows cũ', 'laptop đã qua sử dụng', 'laptop giá rẻ', '7Teck.vn'],
});

type UsedWindowsCatalogPageProps = {
  params: Promise<{
    catalogID: string;
  }>;
};

export default async function UsedWindowsCatalogPage({ params }: UsedWindowsCatalogPageProps) {
  const { catalogID } = await params;

  const windows = await getWindowsByCatalogId(catalogID);

  const products: ProductBase[] = windows.map((item) => ({
    _id: item._id,
    name: item.windows_name,
    slug: item.windows_slug,
    img: item.windows_img,
    price: item.windows_price,
    sale: item.windows_sale ?? 0,
    status: item.windows_status,
    color: item.windows_color,
    ram: item.windows_catalog_id?.w_cat_memory_and_storage?.w_cat_ram ?? '',
    cpu: item.windows_catalog_id?.w_cat_processor?.w_cat_cpu_technology ?? '',
    storage: Array.isArray(item.windows_catalog_id?.w_cat_memory_and_storage?.w_cat_hard_drive)
      ? item.windows_catalog_id?.w_cat_memory_and_storage?.w_cat_hard_drive.filter(Boolean).join(', ')
      : '',
    lcd: item.windows_catalog_id?.w_cat_display?.w_cat_screen_size ?? '',
    gpu: item.windows_catalog_id?.w_cat_graphics_and_audio?.w_cat_gpu ?? '',
  }));

  return <ClientUsedProductByCatalogPage products={products} title="Laptop Windows" basePath="windows" />;
}
