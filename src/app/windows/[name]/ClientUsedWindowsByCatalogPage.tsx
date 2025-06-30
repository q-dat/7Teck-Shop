'use client';
import ClientUsedProductPage from '@/components/userPage/page/ClientUsedProductByCatalogPage';
import { IWindows } from '@/types/type/products/windows/windows';

export default function ClientUsedWindowsByCatalogPage({ windows }: { windows: IWindows[] }) {
  const mapped = windows.map((win) => ({
    _id: win._id,
    name: win.windows_name,
    image: win.windows_img,
    price: win.windows_price,
    sale: win.windows_sale ?? null,
    status: win.windows_status ?? null,
    view: win.windows_view ?? 0,
    color: win.windows_color,
    ram: win.windows_catalog_id.w_cat_memory_and_storage?.w_cat_ram,
  }));

  return <ClientUsedProductPage products={mapped} title="Laptop Windows" basePath="windows" />;
}
