'use client';
import ClientUsedProductPage from '@/components/userPage/page/ClientUsedProductByCatalogPage';
import { ITablet } from '@/types/type/tablet/tablet';

export default function UsedTabletPage({ tablets }: { tablets: ITablet[] }) {
  const mapped = tablets.map((item) => ({
    _id: item._id,
    name: item.tablet_name,
    image: item.tablet_img,
    price: item.tablet_price,
    sale: item.tablet_sale ?? null,
    status: item.tablet_status ?? null,
    view: item.tablet_view ?? 0,
  }));

  return <ClientUsedProductPage products={mapped} title="Máy Tính Bảng" basePath="may-tinh-bang" />;
}
