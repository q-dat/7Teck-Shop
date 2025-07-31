'use client';
import ClientProductPage from '@/components/userPage/page/ClientProductPage';
import { GroupedPhone } from '@/types/type/products/phone/phone';

// export default function ClientPhonePage({ phones }: { phones: IPhone[] }) {
//   const mappedPhones = phones.map((phone) => ({
//     _id: phone._id,
//     name: phone.name,
//     img: phone.img,
//     price: phone.price,
//     color: phone.color,
//     ram: phone.phone_catalog_id.configuration_and_memory.ram,
//     cpu: phone.phone_catalog_id.configuration_and_memory.cpu_chip,
//     sale: phone.sale,
//     status: phone.status,
//   }));

//   return <ClientProductPage products={mappedPhones} title="Điện Thoại" basePath="dien-thoai" />;
// }

export default function ClientPhonePage({ groupedPhones }: { groupedPhones: GroupedPhone[] }) {
  const mappedPhones = groupedPhones.map((group) => {
    const defaultVariant = group.variants[0];
    const config = group.catalog?.configuration_and_memory;

    return {
      _id: defaultVariant._id,
      name: defaultVariant.name,
      img: defaultVariant.img,
      price: defaultVariant.price,
      color: defaultVariant.color,
      ram: config?.ram ?? 'N/A',
      cpu: config?.cpu_chip ?? 'N/A',
      sale: defaultVariant.sale,
      status: defaultVariant.status,
      variants: group.variants.map((v) => ({
        ...v,
        ram: config?.ram ?? 'N/A',
        cpu: config?.cpu_chip ?? 'N/A',
      })),
    };
  });

  return <ClientProductPage products={mappedPhones} title="Điện Thoại" basePath="dien-thoai" />;
}
