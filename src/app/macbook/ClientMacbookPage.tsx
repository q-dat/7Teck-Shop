'use client';
import ClientProductPage from '@/components/userPage/page/ClientProductPage';
import { getNewGroupedMacbook } from '@/services/products/macbookService';
import { GroupedMacbook } from '@/types/type/products/macbook/macbook';
import { useState } from 'react';

export default function ClientMacbookPage({ groupedMacbook }: { groupedMacbook: GroupedMacbook[] }) {
  const [mappedMacbook, setMappedMacbook] = useState(() => mapGroupedMacbook(groupedMacbook));

  // Danh sách thương hiệu tĩnh
  const brands = [
    { name: 'M1', icon: '' },
    { name: 'M2', icon: '' },
    { name: 'M3', icon: '' },
    { name: 'M4', icon: '' },
  ];
  // Hàm mapping
  function mapGroupedMacbook(data: GroupedMacbook[]) {
    return data.map((group) => {
      const defaultVariant = group.variants[0];

      return {
        _id: defaultVariant._id,
        name: defaultVariant.macbook_name,
        img: defaultVariant.macbook_img,
        price: defaultVariant.macbook_price,
        color: defaultVariant.macbook_color,
        ram: defaultVariant.macbook_catalog_id?.m_cat_memory_and_storage.m_cat_ram ?? '',
        cpu: defaultVariant.macbook_catalog_id?.m_cat_processor.m_cat_cpu_technology ?? '',
        gpu: defaultVariant.macbook_catalog_id?.m_cat_graphics_and_audio.m_cat_gpu ?? '',
        lcd: defaultVariant.macbook_catalog_id?.m_cat_display.m_cat_screen_size ?? '',
        sale: defaultVariant.macbook_sale,
        status: defaultVariant.macbook_status,
        variants: group.variants.map((v) => ({
          _id: v._id,
          name: v.macbook_name,
          img: v.macbook_img,
          price: v.macbook_price,
          color: v.macbook_color,
          ram: v.macbook_catalog_id?.m_cat_memory_and_storage.m_cat_ram ?? '',
          cpu: v.macbook_catalog_id?.m_cat_processor.m_cat_cpu_technology ?? '',
          gpu: v.macbook_catalog_id?.m_cat_graphics_and_audio.m_cat_gpu ?? '',
          lcd: v.macbook_catalog_id?.m_cat_display.m_cat_screen_size ?? '',
          sale: v.macbook_sale,
          status: v.macbook_status,
        })),
      };
    });
  }

  // Handle khi chọn brand
  const handleBrandSelect = async (brand: string | null) => {
    const data = await getNewGroupedMacbook(brand ?? undefined);
    setMappedMacbook(mapGroupedMacbook(data));
  };

  return <ClientProductPage products={mappedMacbook} title="Laptop" basePath="" brands={brands} onBrandSelect={handleBrandSelect} />;
}
