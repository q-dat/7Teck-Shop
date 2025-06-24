'use client';
import ClientProductPage from '@/components/userPage/page/ClientProductPage';
import { ITablet } from '@/types/type/tablet/tablet';

export default function ClientTabletPage({ tablets }: { tablets: ITablet[] }) {
  const mapped = tablets.map((item) => ({
    _id: item._id,
    name: item.tablet_name,
    image: item.tablet_img,
    price: item.tablet_price,
    sale: item.tablet_sale,
    status: item.tablet_status,
  }));

  return <ClientProductPage products={mapped} title="Ipad" basePath="tablet" />;
}
