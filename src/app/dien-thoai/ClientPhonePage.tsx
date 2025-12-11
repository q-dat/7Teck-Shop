'use client';
import { useState } from 'react';
import ClientProductPage from '@/components/userPage/page/ClientProductPage';
import { GroupedPhone } from '@/types/type/products/phone/phone';
import { getNewGroupedPhones } from '@/services/products/phoneService';
import { SiSamsung, SiApple, SiOppo, SiXiaomi, SiVivo } from 'react-icons/si';

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
  const [mappedPhones, setMappedPhones] = useState(() => mapGroupedPhones(groupedPhones));

  // Danh sách thương hiệu tĩnh
  const brands = [
    { name: 'iPhone', icon: <SiApple /> },
    { name: 'Samsung', icon: <SiSamsung /> },
    { name: 'Oppo', icon: <SiOppo /> },
    { name: 'Xiaomi', icon: <SiXiaomi /> },
    { name: 'Vivo', icon: <SiVivo /> },
  ];
  // Hàm mapping
  function mapGroupedPhones(data: GroupedPhone[]) {
    return data.map((group) => {
      const defaultVariant = group.variants[0];
      const config = group.catalog?.configuration_and_memory;

      return {
        _id: defaultVariant._id,
        name: defaultVariant.name,
        img: defaultVariant.img,
        price: defaultVariant.price,
        color: defaultVariant.color,
        ram: config?.ram ?? '',
        cpu: config?.cpu_chip ?? '',
        sale: defaultVariant.sale,
        status: defaultVariant.status,
        variants: group.variants.map((v) => ({
          ...v,
          ram: config?.ram ?? '',
          cpu: config?.cpu_chip ?? '',
        })),
      };
    });
  }

  // Handle khi chọn brand
  const handleBrandSelect = async (brand: string | null) => {
    const data = await getNewGroupedPhones(brand ?? undefined);
    setMappedPhones(mapGroupedPhones(data));
  };

  return (
    <ClientProductPage
      products={mappedPhones}
      title="Điện Thoại"
      // basePath="dien-thoai"
      basePath=""
      brands={brands}
      onBrandSelect={handleBrandSelect}
    />
  );
}
