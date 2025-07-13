'use client';
import ClientUsedProductCatalogPage, { UsedProductCatalog } from '@/components/userPage/page/ClientUsedProductCatalogPage';
import { IMacbookCatalog } from '@/types/type/catalogs/macbook-catalog/macbook-catalog';

export default function ClientUsedMacbookPage({ macbookCatalogs }: { macbookCatalogs: IMacbookCatalog[] }) {
  const data: UsedProductCatalog[] = macbookCatalogs.map((p) => ({
    _id: p._id,
    name: p.m_cat_name,
    img: p.m_cat_img,
    price: p.m_cat_price,
    productCount: p.m_cat_macbookCount,
    status: p.m_cat_status,
  }));

  return <ClientUsedProductCatalogPage data={data} title="Laptop Macbook" basePath="macbook" namePrefix={'Laptop'} />;
}
