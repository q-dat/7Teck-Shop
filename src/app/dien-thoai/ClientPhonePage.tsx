'use client';
import { useState } from 'react';
import ClientProductPage from '@/components/userPage/page/ClientProductPage';
import { GroupedPhone, PhoneFilterParams } from '@/types/type/products/phone/phone';
import { getNewGroupedPhones } from '@/services/products/phoneService';
import { SiSamsung, SiApple, SiOppo, SiXiaomi, SiVivo } from 'react-icons/si';
import PhoneFilterBar from '@/components/userPage/ui/sort/PhoneFilterBar';

export default function ClientPhonePage({ groupedPhones }: { groupedPhones: GroupedPhone[] }) {
  const [mappedPhones, setMappedPhones] = useState(() => mapGroupedPhones(groupedPhones));
  const [activeFilters, setActiveFilters] = useState<PhoneFilterParams>({
    status: '0',
    sort: 'newest',
  });

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
        storage: config?.storage_capacity ?? '',
        cpu: config?.cpu_chip ?? '',
        sale: defaultVariant.sale,
        status: defaultVariant.status,
        variants: group.variants.map((v) => ({
          ...v,
          ram: config?.ram ?? '',
          cpu: config?.cpu_chip ?? '',
          storage: config?.storage_capacity ?? '',
        })),
      };
    });
  }
  // Handle khi thay đổi filter (giá, màu sắc, ram, cpu, sắp xếp)
  const handleFilterChange = async (newFilters: PhoneFilterParams) => {
    const mergedFilters: PhoneFilterParams = {
      ...activeFilters,
      ...newFilters,
    };

    setActiveFilters(mergedFilters);

    const data = await getNewGroupedPhones(mergedFilters);
    setMappedPhones(mapGroupedPhones(data));
  };

  // Handle khi chọn brand
  const handleBrandSelect = async (brand: string | null) => {
    const newFilters: PhoneFilterParams = {
      ...activeFilters,
      status: '0',
      name: brand ?? undefined,
    };

    setActiveFilters(newFilters);

    const data = await getNewGroupedPhones(newFilters);
    setMappedPhones(mapGroupedPhones(data));
  };

  return (
    <ClientProductPage
      products={mappedPhones}
      title="Điện Thoại"
      basePath=""
      brands={brands}
      filterNode={<PhoneFilterBar activeFilters={activeFilters} onChange={handleFilterChange} />}
      onBrandSelect={handleBrandSelect}
    />
  );
}
