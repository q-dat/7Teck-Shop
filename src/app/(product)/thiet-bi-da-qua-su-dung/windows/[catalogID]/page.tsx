import { ProductBase } from '@/components/userPage/page/(san-pham)/ClientProductPage';
import ClientUsedProductByCatalogPage from '@/components/userPage/page/(thiet-bi-da-qua-su-dung)/ClientUsedProductByCatalogPage';
import { getWindowsByCatalogId } from '@/services/products/windowsService';

type UsedWindowsCatalogPageProps = {
    params: Promise<{
        catalogID: string;
    }>;
};

export default async function UsedWindowsCatalogPage({ params }: UsedWindowsCatalogPageProps) {
    const { catalogID } = await params;

    const windows = await getWindowsByCatalogId(catalogID);

    const products: ProductBase[] = windows.map((item) => ({
        _id: item._id,
        name: item.windows_name,
        slug: item.windows_slug,
        img: item.windows_img,
        price: item.windows_price,
        sale: item.windows_sale ?? 0,
        status: item.windows_status,
        color: item.windows_color,
        ram: item.windows_catalog_id?.w_cat_memory_and_storage?.w_cat_ram ?? '',
        cpu: item.windows_catalog_id?.w_cat_processor?.w_cat_cpu_technology ?? '',
        storage: Array.isArray(item.windows_catalog_id?.w_cat_memory_and_storage?.w_cat_hard_drive)
            ? item.windows_catalog_id?.w_cat_memory_and_storage?.w_cat_hard_drive.filter(Boolean).join(', ')
            : '',
        lcd: item.windows_catalog_id?.w_cat_display?.w_cat_screen_size ?? '',
        gpu: item.windows_catalog_id?.w_cat_graphics_and_audio?.w_cat_gpu ?? '',
    }));

    return <ClientUsedProductByCatalogPage products={products} title="Laptop Windows" basePath="windows" />;
}