import { StructuredData } from '@/metadata/structuredData';

import ClientPhoneDetailPage from '@/app/dien-thoai/[name]/[id]/ClientPhoneDetailPage';

import { IPhone } from '@/types/type/products/phone/phone';
import { Metadata } from 'next';
import { JsonLdProduct } from '@/types/types/seo/jsonld';

import { getPhoneBySlug } from '@/services/products/phoneService';

type RouteParams = {
  slug: string;
};

type ProductUnion = {
  type: 'phone';
  product: IPhone;
  metadata: Metadata;
  jsonLd: JsonLdProduct;
};

//
// ✅ SEO
//
export async function generateMetadata({ params }: { params: Promise<RouteParams> }): Promise<Metadata> {
  const { slug } = await params;
  const normalizedSlug = slug.trim().toLowerCase();

  const phone = await getPhoneBySlug(normalizedSlug);

  if (!phone) {
    return {
      title: 'Không tìm thấy sản phẩm',
      robots: 'noindex, nofollow',
    };
  }

  return {
    title: phone.name,
    description: phone.des || phone.name,
  };
}

//
// ✅ PAGE
//
export default async function ProductDetailUnified({ params }: { params: Promise<RouteParams> }) {
  const { slug } = await params;
  const normalizedSlug = slug.trim().toLowerCase();

  const phone = await getPhoneBySlug(normalizedSlug);

  if (!phone) {
    return <div className="mt-10 text-center">Không tìm thấy sản phẩm.</div>;
  }

  const data: ProductUnion = {
    type: 'phone',
    product: phone,
    metadata: {} as Metadata,
    jsonLd: {} as JsonLdProduct,
  };

  return (
    <>
      <StructuredData data={data.jsonLd} />
      <ClientPhoneDetailPage phone={data.product} />
    </>
  );
}

export const revalidate = 18000;
