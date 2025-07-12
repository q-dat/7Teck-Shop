'use client';
import ClientUsedProductPage from '@/components/userPage/page/ClientUsedProductByCatalogPage';
import { IPhone } from '@/types/type/products/phone/phone';

export default function ClientUsedPhoneByCatalogPage({ phones }: { phones: IPhone[] }) {
  const mapped = phones.map((phone) => ({
    _id: phone._id,
    name: phone.name,
    img: phone.img,
    price: phone.price,
    sale: phone.sale ?? null,
    status: phone.status ?? null,
    view: phone.view ?? 0,
    color: phone.color,
    ram: phone.phone_catalog_id.configuration_and_memory?.ram,
  }));

  return <ClientUsedProductPage products={mapped} title="7teck.vn" basePath="dien-thoai" />;
}
