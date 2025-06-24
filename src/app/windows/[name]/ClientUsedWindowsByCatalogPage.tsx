'use client';
import ClientUsedProductPage from '@/components/userPage/page/ClientUsedProductByCatalogPage';
import { IWindows } from '@/types/type/windows/windows';

export default function UsedWindowsPage({ windows }: { windows: IWindows[] }) {
  const mapped = windows.map((item) => ({
    _id: item._id,
    name: item.windows_name,
    image: item.windows_img,
    price: item.windows_price,
    sale: item.windows_sale ?? null,
    status: item.windows_status ?? null,
    view: item.windows_view ?? 0,
  }));

  return <ClientUsedProductPage products={mapped} title="Laptop Windows" basePath="windows" />;
}
