// 'use client';
// import ClientUsedProductCatalogPage, { UsedProductCatalog } from '@/components/userPage/page/(danh-muc-da-qua-su-dung)/ClientUsedProductCatalogPage';
// import { IWindowsCatalog } from '@/types/type/catalogs/windows-catalog/windows-catalog';

// export default function ClientUsedWindowsPage({ windowsCatalogs }: { windowsCatalogs: IWindowsCatalog[] }) {
//   const data: UsedProductCatalog[] = windowsCatalogs.map((p) => ({
//     _id: p._id,
//     name: p.w_cat_name,
//     slug: p.w_cat_slug,
//     img: p.w_cat_img,
//     price: p.w_cat_price,
//     productCount: p.w_cat_windowsCount,
//     status: p.w_cat_status,
//   }));

//   return <ClientUsedProductCatalogPage data={data} title="" basePath="thiet-bi-da-qua-su-dung/windows" namePrefix={'Laptop'} />;
// }

'use client';
import ClientUsedProductCatalogPage, {
  UsedProduct,
} from '@/components/userPage/page/(danh-muc-da-qua-su-dung)/ClientUsedProductCatalogPage';
import { IWindows } from '@/types/type/products/windows/windows';

export default function ClientUsedWindowsPage({ windows }: { windows: IWindows[] }) {
  const data: UsedProduct[] = windows.map((windowProduct) => ({
    _id: windowProduct._id,
    name: windowProduct.windows_name,
    slug: windowProduct.windows_slug,
    img: windowProduct.windows_img,
    price: windowProduct.windows_price,
    status: windowProduct.windows_status,
    basePath: 'windows',
    namePrefix: '',
  }));

  return <ClientUsedProductCatalogPage data={data} title="Laptop Windows - Cũ" />;
}