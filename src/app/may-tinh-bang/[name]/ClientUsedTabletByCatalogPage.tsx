'use client';
import ClientUsedProductPage from '@/components/userPage/page/ClientUsedProductByCatalogPage';
import { ITablet } from '@/types/type/products/tablet/tablet';

export default function ClientUsedTabletByCatalogPage({ tablets }: { tablets: ITablet[] }) {
  const mapped = tablets.map((tablet) => ({
    _id: tablet._id,
    name: tablet.tablet_name,
    img: tablet.tablet_img,
    price: tablet.tablet_price,
    sale: tablet.tablet_sale ?? null,
    status: tablet.tablet_status ?? null,
    view: tablet.tablet_view ?? 0,
    color: tablet.tablet_color,
    ram: tablet.tablet_catalog_id.t_cat_memory_and_storage?.t_cat_ram,
  }));

  return <ClientUsedProductPage products={mapped} title="Máy Tính Bảng" basePath="may-tinh-bang" />;
}
