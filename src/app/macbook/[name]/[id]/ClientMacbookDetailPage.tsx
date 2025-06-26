'use client';
import { macbookFieldMap } from '@/types/type/optionsData/macbookFieldMap';
import { IMacbook } from '@/types/type/macbook/macbook';
import ClientProductDetailPage, { ProductCatalogGroup } from '@/components/userPage/page/ClientProductDetailPage';

export default function ClientMacbookDetailPage({ mac }: { mac: IMacbook }) {
  const mappedProduct = {
    _id: mac._id,
    name: mac.macbook_name,
    img: mac.macbook_img,
    price: mac.macbook_price,
    sale: mac.macbook_sale ?? null,
    color: mac.macbook_color ?? null,
    status: mac.macbook_status ?? null,
    des: mac.macbook_des ?? null,
    thumbnail: mac.macbook_thumbnail,
    catalog: mac.macbook_catalog_id as unknown as Record<string, ProductCatalogGroup>,
    catalogContent: mac.macbook_catalog_id?.m_cat_content ?? '',
  };

  return <ClientProductDetailPage product={mappedProduct} fieldMap={macbookFieldMap} namePrefix="Laptop" />;
}
