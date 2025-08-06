'use client';
import { windowsFieldMap } from '@/types/type/optionsData/windowsFieldMap';
import { IWindows } from '@/types/type/products/windows/windows';
import ClientProductDetailPage, { ProductCatalogGroup } from '@/components/userPage/page/ClientProductDetailPage';
import { useEffect, useState } from 'react';
import { getWindowsByCatalogId } from '@/services/products/windowsService';

export default function ClientWindowsDetailPage({ win }: { win: IWindows }) {
  const [relatedWindows, setRelatedWindows] = useState<IWindows[]>([]);

  useEffect(() => {
    const catalogID = win?.windows_catalog_id?._id;
    if (catalogID) {
      getWindowsByCatalogId(catalogID).then((data) => setRelatedWindows(data));
    }
  }, [win]);

  const mappedProduct = {
    _id: win._id,
    name: win.windows_name,
    img: win.windows_img,
    price: win.windows_price,
    sale: win.windows_sale,
    color: win.windows_color,
    ram: win.windows_catalog_id.w_cat_memory_and_storage?.w_cat_ram,
    status: win.windows_status,
    des: win.windows_des,
    thumbnail: win.windows_thumbnail,
    catalog: win.windows_catalog_id as unknown as Record<string, ProductCatalogGroup>,
    catalogContent: win.windows_catalog_id?.w_cat_content ?? '',
  };

  const mappedRelated = relatedWindows.map((win) => ({
    _id: win._id,
    name: win.windows_name,
    img: win.windows_img,
    price: win.windows_price,
    sale: win.windows_sale,
    color: win.windows_color,
    ram: win.windows_catalog_id.w_cat_memory_and_storage?.w_cat_ram,
    status: win.windows_status,
    des: win.windows_des,
    thumbnail: win.windows_thumbnail,
    catalog: win.windows_catalog_id as unknown as Record<string, ProductCatalogGroup>,
    catalogContent: win.windows_catalog_id?.w_cat_content ?? '',
  }));
  return (
    <ClientProductDetailPage
      product={mappedProduct}
      fieldMap={windowsFieldMap}
      namePrefix="Laptop"
      basePath="windows"
      relatedProducts={mappedRelated}
    />
  );
}
