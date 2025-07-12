'use client';
import ClientProductPage from '@/components/userPage/page/ClientProductPage';
import { IMacbook } from '@/types/type/products/macbook/macbook';

export default function ClientMacbookPage({ macbook }: { macbook: IMacbook[] }) {
  const mappedMacbooks = macbook.map((macbook) => ({
    _id: macbook._id,
    name: macbook.macbook_name,
    img: macbook.macbook_img,
    price: macbook.macbook_price,
    color: macbook.macbook_color,
    ram: macbook.macbook_catalog_id.m_cat_memory_and_storage.m_cat_ram,
    cpu: macbook.macbook_catalog_id.m_cat_processor.m_cat_cpu_technology,
    gpu: macbook.macbook_catalog_id.m_cat_graphics_and_audio.m_cat_gpu,
    lcd: macbook.macbook_catalog_id.m_cat_display.m_cat_screen_size,
    sale: macbook.macbook_sale,
    status: macbook.macbook_status,
  }));

  return <ClientProductPage products={mappedMacbooks} title="Laptop" basePath="macbook" />;
}
