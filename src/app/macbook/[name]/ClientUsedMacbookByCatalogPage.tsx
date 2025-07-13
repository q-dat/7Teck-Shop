'use client';
import ClientUsedProductPage from '@/components/userPage/page/ClientUsedProductByCatalogPage';
import { IMacbook } from '@/types/type/products/macbook/macbook';

export default function ClientUsedMacbookByCatalogPage({ macbook }: { macbook: IMacbook[] }) {
  const mapped = macbook.map((mac) => ({
    _id: mac._id,
    name: mac.macbook_name,
    img: mac.macbook_img,
    price: mac.macbook_price,
    sale: mac.macbook_sale ?? null,
    status: mac.macbook_status ?? null,
    view: mac.macbook_view ?? 0,
    color: mac.macbook_color,
    ram: mac.macbook_catalog_id.m_cat_memory_and_storage?.m_cat_ram,
  }));

  return <ClientUsedProductPage products={mapped} title="Laptop Macbook" basePath="macbook" />;
}
