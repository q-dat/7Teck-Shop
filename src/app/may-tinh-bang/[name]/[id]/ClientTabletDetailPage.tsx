'use client';
import { tabletFieldMap } from '@/types/type/optionsData/tabletFieldMap';
import { ITablet } from '@/types/type/tablet/tablet';
import ClientProductDetailPage, { ProductCatalogGroup } from '@/components/userPage/page/ClientProductDetailPage';

export default function ClientTabletDetailPage({ tablet }: { tablet: ITablet }) {
  const mappedProduct = {
    _id: tablet._id,
    name: tablet.tablet_name,
    img: tablet.tablet_img,
    price: tablet.tablet_price,
    sale: tablet.tablet_sale ?? null,
    color: tablet.tablet_color ?? null,
    status: tablet.tablet_status ?? null,
    des: tablet.tablet_des ?? null,
    thumbnail: tablet.tablet_thumbnail,
    catalog: tablet.tablet_catalog_id as unknown as Record<string, ProductCatalogGroup>,
    catalogContent: tablet.tablet_catalog_id?.t_cat_content ?? '',
  };

  return <ClientProductDetailPage product={mappedProduct} fieldMap={tabletFieldMap} namePrefix="Máy Tính Bảng" />;
}
