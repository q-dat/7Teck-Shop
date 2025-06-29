'use client';
import ClientUsedProductCatalogPage, { UsedProductCatalog } from '../../components/userPage/page/ClientUsedProductCatalogPage';
import { IPhoneCatalog } from '@/types/type/catalogs/phone-catalog/phone-catalog';

export default function ClientUsedPhonePage({ phoneCatalogs }: { phoneCatalogs: IPhoneCatalog[] }) {
  const data: UsedProductCatalog[] = phoneCatalogs.map((p) => ({
    _id: p._id,
    name: p.name,
    img: p.img,
    price: p.price,
    productCount: p.phoneCount,
    status: p.status,
  }));

  return <ClientUsedProductCatalogPage data={data} title="Điện Thoại" basePath="dien-thoai" namePrefix={'Điện Thoại'} />;
}
