'use client';
import ClientUsedProductByCatalogPage from '@/components/userPage/page/ClientUsedProductByCatalogPage';
import { IPhone } from '@/types/type/phone/phone';

export default function UsedPhonePage({ phones }: { phones: IPhone[] }) {
  return (
    <ClientUsedProductByCatalogPage
      title="Điện Thoại"
      data={phones}
      getName={(p) => p.name}
      getImage={(p) => p.img}
      getPrice={(p) => p.price}
      getSale={(p) => p.sale ?? null}
      getView={(p) => p.view ?? 0}
      getStatus={(p) => p.status ?? null}
      getId={(p) => p._id}
      buildLink={(slug, id) => `/dien-thoai/${slug}/${id}`}
    />
  );
}
