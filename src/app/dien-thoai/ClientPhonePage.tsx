'use client';
import ClientProductPage from '@/components/userPage/page/ClientProductPage';
import { IPhone } from '@/types/type/phone/phone';

export default function ClientPhonePage({ phones }: { phones: IPhone[] }) {
  const mappedPhones = phones.map((phone) => ({
    _id: phone._id,
    name: phone.name,
    image: phone.img,
    price: phone.price,
    sale: phone.sale,
    status: phone.status,
  }));

  return <ClientProductPage products={mappedPhones} title="Điện Thoại" basePath="dien-thoai" />;
}
