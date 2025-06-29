'use client';
import { phoneFieldMap } from '@/types/type/optionsData/phoneFieldMap';
import { IPhone } from '@/types/type/products/phone/phone';
import ClientProductDetailPage, { ProductCatalogGroup } from '@/components/userPage/page/ClientProductDetailPage';

export default function ClientPhoneDetailPage({ phone }: { phone: IPhone }) {
  const mappedProduct = {
    _id: phone._id,
    name: phone.name,
    img: phone.img,
    price: phone.price,
    sale: phone.sale,
    color: phone.color,
    ram: phone.phone_catalog_id.configuration_and_memory?.ram,
    status: phone.status,
    des: phone.des,
    thumbnail: phone.thumbnail,
    catalog: phone.phone_catalog_id as unknown as Record<string, ProductCatalogGroup>,
    catalogContent: phone.phone_catalog_id?.content ?? '',
  };

  return <ClientProductDetailPage product={mappedProduct} fieldMap={phoneFieldMap} namePrefix="Điện thoại" />;
}
