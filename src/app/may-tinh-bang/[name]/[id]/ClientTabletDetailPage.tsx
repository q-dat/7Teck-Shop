'use client';
import { tabletFieldMap } from '@/types/type/optionsData/tabletFieldMap';
import ClientProductDetailPage, { ProductCatalogGroup } from '@/components/userPage/page/ClientProductDetailPage';
import { ITablet } from '@/types/type/products/tablet/tablet';
import { useEffect, useState } from 'react';
import { getTabletsByCatalogId } from '@/services/products/tabletService';

export default function ClientTabletDetailPage({ tablet }: { tablet: ITablet }) {
  const [relatedTablets, setRelatedTablets] = useState<ITablet[]>([]);

  useEffect(() => {
    const catalogID = tablet?.tablet_catalog_id?._id;
    if (catalogID) {
      getTabletsByCatalogId(catalogID).then((data) => setRelatedTablets(data));
    }
  }, [tablet]);

  const mappedProduct = {
    _id: tablet._id,
    name: tablet.tablet_name,
    img: tablet.tablet_img,
    price: tablet.tablet_price,
    sale: tablet.tablet_sale,
    color: tablet.tablet_color,
    ram: tablet.tablet_catalog_id.t_cat_memory_and_storage?.t_cat_ram,
    status: tablet.tablet_status,
    des: tablet.tablet_des,
    thumbnail: tablet.tablet_thumbnail,
    catalog: tablet.tablet_catalog_id as unknown as Record<string, ProductCatalogGroup>,
    catalogContent: tablet.tablet_catalog_id?.t_cat_content ?? '',
  };

  const mappedRelated = relatedTablets.map((tablet) => ({
    _id: tablet._id,
    name: tablet.tablet_name,
    img: tablet.tablet_img,
    price: tablet.tablet_price,
    sale: tablet.tablet_sale,
    color: tablet.tablet_color,
    ram: tablet.tablet_catalog_id.t_cat_memory_and_storage?.t_cat_ram,
    status: tablet.tablet_status,
    des: tablet.tablet_des,
    thumbnail: tablet.tablet_thumbnail,
    catalog: tablet.tablet_catalog_id as unknown as Record<string, ProductCatalogGroup>,
    catalogContent: tablet.tablet_catalog_id?.t_cat_content ?? '',
  }));

  return <ClientProductDetailPage product={mappedProduct} fieldMap={tabletFieldMap} namePrefix="Máy Tính Bảng" relatedProducts={mappedRelated} />;
}
