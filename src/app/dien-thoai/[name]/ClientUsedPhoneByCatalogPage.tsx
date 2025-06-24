'use client';
import ClientUsedProductPage from '@/components/userPage/page/ClientUsedProductByCatalogPage';
import { IPhone } from '@/types/type/phone/phone';

export default function UsedPhonePage({ phones }: { phones: IPhone[] }) {
  const mapped = phones.map((item) => ({
    _id: item._id,
    name: item.name,
    image: item.img,
    price: item.price,
    sale: item.sale ?? null,
    status: item.status ?? null,
    view: item.view ?? 0,
  }));

  return <ClientUsedProductPage products={mapped} title="Điện Thoại" basePath="dien-thoai" />;
}
