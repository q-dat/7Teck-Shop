'use client';
import ClientProductPage from '@/components/userPage/page/ClientProductPage';
import { IWindows } from '@/types/type/products/windows/windows';

export default function ClientWindowsPage({ windows }: { windows: IWindows[] }) {
  const mapped = windows.map((windows) => ({
    _id: windows._id,
    name: windows.windows_name,
    image: windows.windows_img,
    price: windows.windows_price,
    color: windows.windows_color,
    ram: windows.windows_catalog_id.w_cat_memory_and_storage.w_cat_ram,
    cpu: windows.windows_catalog_id.w_cat_processor.w_cat_cpu_technology,
    gpu: windows.windows_catalog_id.w_cat_graphics_and_audio.w_cat_gpu,
    lcd: windows.windows_catalog_id.w_cat_display.w_cat_screen_size,
    sale: windows.windows_sale,
    status: windows.windows_status,
  }));

  return <ClientProductPage products={mapped} title="Laptop Windows" basePath="windows" />;
}
