'use client';
import ClientUsedProductByCatalogPage from '@/components/userPage/page/ClientUsedProductByCatalogPage';
import { ITablet } from '@/types/type/tablet/tablet';

export default function UsedTabletPage({ tablets }: { tablets: ITablet[] }) {
  return (
    <ClientUsedProductByCatalogPage
      title="Máy Tính Bảng"
      data={tablets}
      getName={(p) => p.tablet_name}
      getImage={(p) => p.tablet_img}
      getPrice={(p) => p.tablet_price}
      getSale={(p) => p.tablet_sale ?? null}
      getView={(p) => p.tablet_view ?? 0}
      getStatus={(p) => p.tablet_status ?? null}
      getId={(p) => p._id}
      buildLink={(slug, id) => `/may-tinh-bang/${slug}/${id}`}
    />
  );
}
