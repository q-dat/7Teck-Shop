'use client';
import { macbookFieldMap } from '@/types/type/optionsData/macbookFieldMap';
import { IMacbook } from '@/types/type/products/macbook/macbook';
import ClientProductDetailPage, { ProductCatalogGroup } from '@/components/userPage/page/ClientProductDetailPage';

export default function ClientMacbookDetailPage({ mac }: { mac: IMacbook }) {
  const mappedProduct = {
    _id: mac._id,
    name: mac.macbook_name,
    img: mac.macbook_img,
    price: mac.macbook_price,
    sale: mac.macbook_sale,
    color: mac.macbook_color,
    ram: mac.macbook_catalog_id.m_cat_memory_and_storage?.m_cat_ram,
    status: mac.macbook_status,
    des: mac.macbook_des,
    thumbnail: mac.macbook_thumbnail,
    catalog: mac.macbook_catalog_id as unknown as Record<string, ProductCatalogGroup>,
    catalogContent: mac.macbook_catalog_id?.m_cat_content ?? '',
  };

  return <ClientProductDetailPage product={mappedProduct} fieldMap={macbookFieldMap} namePrefix="Laptop" />;
}
