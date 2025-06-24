'use client';
import ClientProductPage from '@/components/userPage/page/ClientProductPage';
import { IWindows } from '@/types/type/windows/windows';

export default function ClientWindowsPage({ windows }: { windows: IWindows[] }) {
  const mapped = windows.map((item) => ({
    _id: item._id,
    name: item.windows_name,
    image: item.windows_img,
    price: item.windows_price,
    sale: item.windows_sale,
    status: item.windows_status,
  }));

  return <ClientProductPage products={mapped} title="Laptop Windows" basePath="windows" />;
}
