'use client';
import ClientUsedProductCatalogPage, {
    UsedProduct,
} from '@/components/userPage/page/(danh-muc-da-qua-su-dung)/ClientUsedProductCatalogPage';
import { IMacbook } from '@/types/type/products/macbook/macbook';
import { IWindows } from '@/types/type/products/windows/windows';

interface ClientUsedLaptopPageProps {
    macbooks: IMacbook[];
    windows: IWindows[];
}

export default function ClientUsedLaptopPage({ macbooks, windows }: ClientUsedLaptopPageProps) {
    const macbookData: UsedProduct[] = macbooks.map((macbook) => ({
        _id: macbook._id,
        name: macbook.macbook_name,
        slug: macbook.macbook_slug,
        img: macbook.macbook_img,
        price: macbook.macbook_price,
        status: macbook.macbook_status,
        basePath: 'macbook',
        namePrefix: 'Macbook',
    }));

    const windowsData: UsedProduct[] = windows.map((windowProduct) => ({
        _id: windowProduct._id,
        name: windowProduct.windows_name,
        slug: windowProduct.windows_slug,
        img: windowProduct.windows_img,
        price: windowProduct.windows_price,
        status: windowProduct.windows_status,
        basePath: 'windows',
        namePrefix: 'Laptop',
    }));

    return <ClientUsedProductCatalogPage data={[...windowsData, ...macbookData]} title="Laptop Windows/Macbook" />;
}