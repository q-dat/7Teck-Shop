'use client';
import ClientUsedProductCatalogPage, { UsedProductCatalog } from '../../components/userPage/page/ClientUsedProductCatalogPage';
import { ITabletCatalog } from '@/types/type/tablet-catalog/tablet-catalog';

export default function ClientUsedTabletPage({ tabletCatalogs }: { tabletCatalogs: ITabletCatalog[] }) {
  const data: UsedProductCatalog[] = tabletCatalogs.map((p) => ({
    _id: p._id,
    name: p.t_cat_name,
    img: p.t_cat_img,
    price: p.t_cat_price,
    productCount: p.t_cat_tabletCount,
    status: p.t_cat_status,
  }));

  return <ClientUsedProductCatalogPage data={data} title="Máy Tính Bảng" basePath="may-tinh-bang" namePrefix={'Máy Tính Bảng'} />;
}
