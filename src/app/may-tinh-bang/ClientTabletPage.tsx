'use client';
import ClientProductPage from '@/components/userPage/page/ClientProductPage';
import { ITablet } from '@/types/type/products/tablet/tablet';

export default function ClientTabletPage({ tablets }: { tablets: ITablet[] }) {
  const mapped = tablets.map((tablet) => ({
    _id: tablet._id,
    name: tablet.tablet_name,
    image: tablet.tablet_img,
    price: tablet.tablet_price,
    color: tablet.tablet_color,
    ram: tablet.tablet_catalog_id.t_cat_memory_and_storage.t_cat_ram,
    cpu: tablet.tablet_catalog_id.t_cat_operating_system_and_cpu.t_cat_cpu_chip,
    sale: tablet.tablet_sale,
    status: tablet.tablet_status,
  }));

  return <ClientProductPage products={mapped} title="Máy Tính Bảng" basePath="may-tinh-bang" />;
}
