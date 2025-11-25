'use client';
import ClientProductPage from '@/components/userPage/page/ClientProductPage';
import { getNewGroupedTablets } from '@/services/products/tabletService';
import { GroupedTablet } from '@/types/type/products/tablet/tablet';
import { useState } from 'react';

// export default function ClientTabletPage({ tablets }: { tablets: ITablet[] }) {
//   const mapped = tablets.map((tablet) => ({
//     _id: tablet._id,
//     name: tablet.tablet_name,
//     img: tablet.tablet_img,
//     price: tablet.tablet_price,
//     color: tablet.tablet_color,
//     ram: tablet.tablet_catalog_id.t_cat_memory_and_storage.t_cat_ram,
//     cpu: tablet.tablet_catalog_id.t_cat_operating_system_and_cpu.t_cat_cpu_chip,
//     sale: tablet.tablet_sale,
//     status: tablet.tablet_status,
//   }));

//   return <ClientProductPage products={mapped} title="Máy Tính Bảng" basePath="may-tinh-bang" />;
// }

export default function ClientTabletPage({ groupedTablets }: { groupedTablets: GroupedTablet[] }) {
  const [mappedTabelets, setMappedTablets] = useState(() => mapGroupedTablets(groupedTablets));

  // Danh sách thương hiệu tĩnh
  const brands = [
    { name: 'Air 4', icon: '' },
    { name: 'Gen 10', icon: '' },
  ];
  // Hàm mapping
  function mapGroupedTablets(data: GroupedTablet[]) {
    return data.map((group) => {
      const defaultVariant = group.variants[0];

      return {
        _id: defaultVariant._id,
        name: defaultVariant.tablet_name,
        img: defaultVariant.tablet_img,
        price: defaultVariant.tablet_price,
        color: defaultVariant.tablet_color,
        ram: defaultVariant.tablet_catalog_id.t_cat_memory_and_storage.t_cat_ram ?? '',
        cpu: defaultVariant.tablet_catalog_id.t_cat_operating_system_and_cpu.t_cat_cpu_chip ?? '',
        sale: defaultVariant.tablet_sale,
        status: defaultVariant.tablet_status,
        variants: group.variants.map((v) => ({
          _id: v._id,
          name: v.tablet_name,
          img: v.tablet_img,
          price: v.tablet_price,
          color: v.tablet_color,
          ram: v.tablet_catalog_id.t_cat_memory_and_storage.t_cat_ram ?? '',
          cpu: v.tablet_catalog_id.t_cat_operating_system_and_cpu.t_cat_cpu_chip ?? '',
          sale: v.tablet_sale,
          status: v.tablet_status,
        })),
      };
    });
  }

  // Handle khi chọn brand
  const handleBrandSelect = async (brand: string | null) => {
    const data = await getNewGroupedTablets(brand ?? undefined);
    setMappedTablets(mapGroupedTablets(data));
  };

  return (
    <ClientProductPage products={mappedTabelets} title="Máy Tính Bảng" basePath="may-tinh-bang" brands={brands} onBrandSelect={handleBrandSelect} />
  );
}
