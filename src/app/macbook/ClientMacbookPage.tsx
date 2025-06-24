'use client';
import ClientProductPage from '@/components/userPage/page/ClientProductPage';
import { IMacbook } from '@/types/type/macbook/macbook';

export default function ClientMacbookPage({ macbook }: { macbook: IMacbook[] }) {
  const mappedMacbooks = macbook.map((item) => ({
    _id: item._id,
    name: item.macbook_name,
    image: item.macbook_img,
    price: item.macbook_price,
    sale: item.macbook_sale,
    status: item.macbook_status,
  }));

  return <ClientProductPage products={mappedMacbooks} title="Laptop Macbook" basePath="macbook" />;
}
