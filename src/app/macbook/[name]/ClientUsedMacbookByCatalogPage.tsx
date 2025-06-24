'use client';
import ClientUsedProductPage from '@/components/userPage/page/ClientUsedProductByCatalogPage';
import { IMacbook } from '@/types/type/macbook/macbook';

export default function ClientUsedMacbookByCatalogPage({ macbook }: { macbook: IMacbook[] }) {
  const mapped = macbook.map((item) => ({
    _id: item._id,
    name: item.macbook_name,
    image: item.macbook_img,
    price: item.macbook_price,
    sale: item.macbook_sale ?? null,
    status: item.macbook_status ?? null,
    view: item.macbook_view ?? 0,
  }));

  return <ClientUsedProductPage products={mapped} title="Laptop Macbook" basePath="macbook" />;
}
