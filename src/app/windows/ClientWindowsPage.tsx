'use client';
import ClientProductPage from '@/components/userPage/page/ClientProductPage';
import { getNewGroupedWindows } from '@/services/products/windowsService';
import { GroupedWindows } from '@/types/type/products/windows/windows';
import { useState } from 'react';

// export default function ClientWindowsPage({ windows }: { windows: IWindows[] }) {
//   const mapped = windows.map((windows) => ({
//     _id: windows._id,
//     name: windows.windows_name,
//     img: windows.windows_img,
//     price: windows.windows_price,
//     color: windows.windows_color,
//     ram: windows.windows_catalog_id.w_cat_memory_and_storage.w_cat_ram,
//     cpu: windows.windows_catalog_id.w_cat_processor.w_cat_cpu_technology,
//     gpu: windows.windows_catalog_id.w_cat_graphics_and_audio.w_cat_gpu,
//     lcd: windows.windows_catalog_id.w_cat_display.w_cat_screen_size,
//     sale: windows.windows_sale,
//     status: windows.windows_status,
//   }));

//   return <ClientProductPage products={mapped} title="Laptop" basePath="windows" />;
// }

export default function ClientWindowsPage({ groupedWindows }: { groupedWindows: GroupedWindows[] }) {
  const [mappedWidnows, setMappedWindows] = useState(() => mapGroupedWindows(groupedWindows));

  // Danh sách thương hiệu tĩnh
  const brands = [
    { name: 'Dell Latitude', icon: '' },
    { name: 'Dell XPS', icon: '' },
  ];
  // Hàm mapping
  function mapGroupedWindows(data: GroupedWindows[]) {
    return data.map((group) => {
      const defaultVariant = group.variants[0];

      return {
        _id: defaultVariant._id,
        name: defaultVariant.windows_name,
        img: defaultVariant.windows_img,
        price: defaultVariant.windows_price,
        color: defaultVariant.windows_color,
        ram: defaultVariant.windows_catalog_id.w_cat_memory_and_storage.w_cat_ram,
        cpu: defaultVariant.windows_catalog_id.w_cat_processor.w_cat_cpu_technology,
        gpu: defaultVariant.windows_catalog_id.w_cat_graphics_and_audio.w_cat_gpu,
        lcd: defaultVariant.windows_catalog_id.w_cat_display.w_cat_screen_size,
        sale: defaultVariant.windows_sale,
        status: defaultVariant.windows_status,
        variants: group.variants.map((v) => ({
          _id: v._id,
          name: v.windows_name,
          img: v.windows_img,
          price: v.windows_price,
          color: v.windows_color,
          ram: v.windows_catalog_id.w_cat_memory_and_storage.w_cat_ram,
          cpu: v.windows_catalog_id.w_cat_processor.w_cat_cpu_technology,
          gpu: v.windows_catalog_id.w_cat_graphics_and_audio.w_cat_gpu,
          lcd: v.windows_catalog_id.w_cat_display.w_cat_screen_size,
          sale: v.windows_sale,
          status: v.windows_status,
        })),
      };
    });
  }

  // Handle khi chọn brand
  const handleBrandSelect = async (brand: string | null) => {
    const data = await getNewGroupedWindows(brand ?? undefined);
    setMappedWindows(mapGroupedWindows(data));
  };

  return <ClientProductPage products={mappedWidnows} title="Laptop" basePath="windows" brands={brands} onBrandSelect={handleBrandSelect} />;
}
