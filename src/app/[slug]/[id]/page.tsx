import { cache } from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { StructuredData } from '@/metadata/structuredData';
import ClientPhoneDetailPage from '@/app/dien-thoai/[slug]/[id]/ClientPhoneDetailPage';
import { IPhone } from '@/types/type/products/phone/phone';
import { JsonLdProduct } from '@/types/types/seo/jsonld';
import { getPhoneById } from '@/services/products/phoneService';
import { generatePhoneMetadata } from '@/metadata/id/phoneMetadata';

type RouteParams = {
  slug: string;
  id: string;
};

// CACHE THEO ID
const getCachedPhone = cache(async (id: string): Promise<IPhone | null> => {
  if (!id) return null;
  return getPhoneById(id);
});

// JSON-LD
function buildJsonLd(phone: IPhone): JsonLdProduct {
  const domain = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
  const url = `${domain}/dien-thoai/${phone.slug}/${phone._id}`;

  return {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: phone.name,
    image: phone.thumbnail?.[0] || phone.img,
    description: phone.des || phone.name,
    sku: phone._id,
    brand: {
      '@type': 'Brand',
      name: phone.phone_catalog_id?.design_and_material?.brand || '7Teck',
    },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'VND',
      price: phone.price,
      availability: 'https://schema.org/InStock',
    },
  };
}

// SEO
export async function generateMetadata({ params }: { params: Promise<RouteParams> }): Promise<Metadata> {
  const { id } = await params;

  const phone = await getCachedPhone(id);

  if (!phone) {
    return {
      title: 'Không tìm thấy sản phẩm - 7Teck.vn',
      description: 'Sản phẩm không tồn tại hoặc đã bị xóa.',
      robots: 'noindex, nofollow',
    };
  }

  return generatePhoneMetadata(phone);
}

// PAGE
export default async function ProductDetailUnified({ params }: { params: Promise<RouteParams> }) {
  const { slug, id } = await params;

  const phone = await getCachedPhone(id);

  if (!phone) {
    return <div className="mt-10 text-center">Không tìm thấy sản phẩm.</div>;
  }

  // validate slug
  if (phone.slug !== slug) {
    // redirect(`/dien-thoai/${phone.slug}/${phone._id}`);
    redirect(`/${phone.slug}`);
  }

  const jsonLd = buildJsonLd(phone);

  return (
    <>
      <StructuredData data={jsonLd} />
      <ClientPhoneDetailPage phone={phone} />
    </>
  );
}

export const revalidate = 18000;
