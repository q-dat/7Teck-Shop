export const revalidate = 18000;

import { PageProps } from '@/types/type/pages/page-props';
import React from 'react';
import ClientMacbookDetailPage from './ClientMacbookDetailPage';
import { slugify } from '@/utils/slugify';
import { IMacbook } from '@/types/type/products/macbook/macbook';
import { getMacbookWithFallback } from '@/services/products/macbookService';
import { generateMacbookMetadata } from '@/metadata/id/macbookMetadata';
import { StructuredData } from '@/metadata/structuredData';

// SEO metadata generation for macbook detail page
export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const mac: IMacbook | null = await getMacbookWithFallback(id);

  if (!mac) {
    return {
      title: 'Không tìm thấy sản phẩm - 7Teck.vn',
      description: 'Sản phẩm không tồn tại hoặc đã bị xóa. Khám phá thêm sản phẩm khác tại 7Teck.vn.',
      robots: 'noindex, nofollow',
    };
  }

  return generateMacbookMetadata(mac);
}

export default async function MacbookDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const mac: IMacbook | null = await getMacbookWithFallback(id);

  if (!mac) {
    return <div className="mt-10 text-center">Không có dữ liệu.</div>;
  }
  //
  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: mac.macbook_name,
    image: mac.macbook_img,
    description: mac.macbook_des || `Apple - ${mac.macbook_name} tại 7Teck`,
    sku: mac._id,
    brand: {
      '@type': 'Brand',
      name: 'Apple',
    },
    offers: {
      '@type': 'Offer',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/macbook/${slugify(mac.macbook_name)}/${mac._id}`,
      priceCurrency: 'VND',
      price: mac.macbook_price.toString(),
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <>
      <StructuredData data={jsonLd} />
      <ClientMacbookDetailPage mac={mac} />
    </>
  );
}
