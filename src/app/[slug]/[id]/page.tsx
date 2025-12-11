import { PageProps } from '@/types/type/pages/page-props';
import { StructuredData } from '@/metadata/structuredData';
import { detectProductType } from '@/services/unified/unifiedProductService';

import ClientMacbookDetailPage from '@/app/macbook/[name]/[id]/ClientMacbookDetailPage';
import ClientPhoneDetailPage from '@/app/dien-thoai/[name]/[id]/ClientPhoneDetailPage';
import ClientTabletDetailPage from '@/app/may-tinh-bang/[name]/[id]/ClientTabletDetailPage';
import ClientWindowsDetailPage from '@/app/windows/[name]/[id]/ClientWindowsDetailPage';

import { IMacbook } from '@/types/type/products/macbook/macbook';
import { IPhone } from '@/types/type/products/phone/phone';
import { ITablet } from '@/types/type/products/tablet/tablet';
import { IWindows } from '@/types/type/products/windows/windows';
import { Metadata } from 'next';
import { JsonLdProduct } from '@/types/types/seo/jsonld';

export type ProductUnion =
  | { type: 'phone'; product: IPhone; metadata: Metadata; jsonLd: JsonLdProduct }
  | { type: 'macbook'; product: IMacbook; metadata: Metadata; jsonLd: JsonLdProduct }
  | { type: 'tablet'; product: ITablet; metadata: Metadata; jsonLd: JsonLdProduct }
  | { type: 'windows'; product: IWindows; metadata: Metadata; jsonLd: JsonLdProduct };
// SEO
export async function generateMetadata({ params }: PageProps) {
  const { id } = params;
  const data = await detectProductType(id);

  if (!data) {
    return {
      title: 'Không tìm thấy sản phẩm – 7Teck.vn',
      robots: 'noindex, nofollow',
    };
  }

  return data.metadata;
}

export default async function ProductDetailUnified({ params }: PageProps) {
  const { id } = params;
  const data = (await detectProductType(id)) as ProductUnion | null;

  if (!data) {
    return <div className="mt-10 text-center">Không tìm thấy sản phẩm.</div>;
  }

  return (
    <>
      <StructuredData data={data.jsonLd} />

      {data.type === 'phone' && <ClientPhoneDetailPage phone={data.product} />}
      {data.type === 'macbook' && <ClientMacbookDetailPage mac={data.product} />}
      {data.type === 'tablet' && <ClientTabletDetailPage tablet={data.product} />}
      {data.type === 'windows' && <ClientWindowsDetailPage win={data.product} />}
    </>
  );
}

export const revalidate = 18000;
