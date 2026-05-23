// 'use client';
// import ClientUsedProductCatalogPage, { UsedProductCatalog } from '@/components/userPage/page/(danh-muc-da-qua-su-dung)/ClientUsedProductCatalogPage';
// import { IPhoneCatalog } from '@/types/type/catalogs/phone-catalog/phone-catalog';

// export default function ClientUsedPhonePage({ phoneCatalogs }: { phoneCatalogs: IPhoneCatalog[] }) {
//   const data: UsedProductCatalog[] = phoneCatalogs.map((p) => ({
//     _id: p._id,
//     name: p.name,
//     slug: p.slug,
//     img: p.img,
//     price: p.price,
//     productCount: p.phoneCount,
//     status: p.status,
//   }));

//   return <ClientUsedProductCatalogPage data={data} title="" basePath="dien-thoai" namePrefix={'Điện Thoại'} />;
// }

'use client';
import ClientUsedProductCatalogPage, {
  UsedProduct,
} from '@/components/userPage/page/(danh-muc-da-qua-su-dung)/ClientUsedProductCatalogPage';
import { IPhone } from '@/types/type/products/phone/phone';

export default function ClientUsedPhonePage({ phones }: { phones: IPhone[] }) {
  const data: UsedProduct[] = phones.map((phone) => ({
    _id: phone._id,
    name: phone.name,
    slug: phone.slug,
    img: phone.img,
    price: phone.price,
    status: phone.status,
    basePath: 'dien-thoai',
    namePrefix: '',
  }));

  return <ClientUsedProductCatalogPage data={data} title="Điện Thoại - Đã Sử Dụng" />;
}