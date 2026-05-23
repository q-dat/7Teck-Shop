// 'use client';
// import ClientUsedProductCatalogPage, { UsedProductCatalog } from '@/components/userPage/page/(danh-muc-da-qua-su-dung)/ClientUsedProductCatalogPage';
// import { IMacbookCatalog } from '@/types/type/catalogs/macbook-catalog/macbook-catalog';

// export default function ClientUsedMacbookPage({ macbookCatalogs }: { macbookCatalogs: IMacbookCatalog[] }) {
//   const data: UsedProductCatalog[] = macbookCatalogs.map((p) => ({
//     _id: p._id,
//     name: p.m_cat_name,
//     slug: p.m_cat_slug,
//     img: p.m_cat_img,
//     price: p.m_cat_price,
//     productCount: p.m_cat_macbookCount,
//     status: p.m_cat_status,
//   }));

//   return <ClientUsedProductCatalogPage data={data} title="" basePath="macbook" namePrefix={'Laptop'} />;
// }

'use client';
import ClientUsedProductCatalogPage, {
  UsedProduct,
} from '@/components/userPage/page/(danh-muc-da-qua-su-dung)/ClientUsedProductCatalogPage';
import { IMacbook } from '@/types/type/products/macbook/macbook';

export default function ClientUsedMacbookPage({ macbooks }: { macbooks: IMacbook[] }) {
  const data: UsedProduct[] = macbooks.map((macbook) => ({
    _id: macbook._id,
    name: macbook.macbook_name,
    slug: macbook.macbook_slug,
    img: macbook.macbook_img,
    price: macbook.macbook_price,
    status: macbook.macbook_status,
    basePath: 'macbook',
    namePrefix: '',
  }));

  return <ClientUsedProductCatalogPage data={data} title="Laptop Macbook - Đã Sử Dụng" />;
}