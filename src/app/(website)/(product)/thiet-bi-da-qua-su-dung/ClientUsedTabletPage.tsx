// 'use client';
// import ClientUsedProductCatalogPage, { UsedProductCatalog } from '@/components/userPage/page/(danh-muc-da-qua-su-dung)/ClientUsedProductCatalogPage';
// import { ITabletCatalog } from '@/types/type/catalogs/tablet-catalog/tablet-catalog';

// export default function ClientUsedTabletPage({ tabletCatalogs }: { tabletCatalogs: ITabletCatalog[] }) {
//   const data: UsedProductCatalog[] = tabletCatalogs.map((p) => ({
//     _id: p._id,
//     name: p.t_cat_name,
//     slug: p.t_cat_slug,
//     img: p.t_cat_img,
//     price: p.t_cat_price,
//     productCount: p.t_cat_tabletCount,
//     status: p.t_cat_status,
//   }));

//   return <ClientUsedProductCatalogPage data={data} title="" basePath="may-tinh-bang" namePrefix={'Máy Tính Bảng'} />;
// }

'use client';
import ClientUsedProductCatalogPage, { UsedProduct } from '@/components/userPage/page/(danh-muc-da-qua-su-dung)/ClientUsedProductCatalogPage';
import { ITablet } from '@/types/type/products/tablet/tablet';

export default function ClientUsedTabletPage({ tablets }: { tablets: ITablet[] }) {
  const data: UsedProduct[] = tablets.map((tablet) => ({
    _id: tablet._id,
    name: tablet.tablet_name,
    slug: tablet.tablet_slug,
    img: tablet.tablet_img,
    price: tablet.tablet_price,
    status: tablet.tablet_status,
    basePath: 'may-tinh-bang',
    namePrefix: '',
  }));

  return <ClientUsedProductCatalogPage data={data} title="Máy Tính Bảng - Cũ" />;
}
