'use client';
import { windowsFieldMap } from '@/types/type/optionsData/windowsFieldMap';
import { IWindows } from '@/types/type/windows/windows';
import ClientProductDetailPage, { ProductCatalogGroup } from '@/components/userPage/page/ClientProductDetailPage';

export default function ClientWindowsDetailPage({ win }: { win: IWindows }) {
  const mappedProduct = {
    _id: win._id,
    name: win.windows_name,
    img: win.windows_img,
    price: win.windows_price,
    sale: win.windows_sale ?? null,
    color: win.windows_color ?? null,
    status: win.windows_status ?? null,
    des: win.windows_des ?? null,
    thumbnail: win.windows_thumbnail,
    catalog: win.windows_catalog_id as unknown as Record<string, ProductCatalogGroup>,
    catalogContent: win.windows_catalog_id?.w_cat_content ?? '',
  };

  return <ClientProductDetailPage product={mappedProduct} fieldMap={windowsFieldMap} namePrefix="Laptop" />;
}
