'use client';
import ClientUsedProductCatalogPage, { UsedProductCatalog } from '@/components/userPage/page/(danh-muc-da-qua-su-dung)/ClientUsedProductCatalogPage';
import { IWindowsCatalog } from '@/types/type/catalogs/windows-catalog/windows-catalog';

export default function ClientUsedWindowsPage({ windowsCatalogs }: { windowsCatalogs: IWindowsCatalog[] }) {
  const data: UsedProductCatalog[] = windowsCatalogs.map((p) => ({
    _id: p._id,
    name: p.w_cat_name,
    slug: p.w_cat_slug,
    img: p.w_cat_img,
    price: p.w_cat_price,
    productCount: p.w_cat_windowsCount,
    status: p.w_cat_status,
  }));

  return <ClientUsedProductCatalogPage data={data} title="Laptop Windows" basePath="thiet-bi-da-qua-su-dung/windows" namePrefix={'Laptop'} />;
}
