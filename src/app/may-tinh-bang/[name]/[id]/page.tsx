export const revalidate = 60;

import { PageProps } from '@/types/type/pages/page-props';
import Head from 'next/head';
import React from 'react';
import { slugify } from '@/utils/slugify';
import { ITablet } from '@/types/type/products/tablet/tablet';
import { getTabletById } from '@/services/products/tabletService';
import ClientTabletDetailPage from './ClientTabletDetailPage';
import { generateTabletMetadata } from '@/metadata/id/tabletMetadata';

// SEO metadata generation for tablet detail page
export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const tablet: ITablet | null = await getTabletById(id);

  if (!tablet) {
    return {
      title: 'Không tìm thấy sản phẩm - 7Teck.vn',
      description: 'Sản phẩm không tồn tại hoặc đã bị xóa. Khám phá thêm sản phẩm khác tại 7Teck.vn.',
      robots: 'noindex, nofollow',
    };
  }

  return generateTabletMetadata(tablet);
}

export default async function TabletDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const tablet: ITablet | null = await getTabletById(id);

  if (!tablet) {
    return <div className="mt-10 text-center">Không có dữ liệu.</div>;
  }
  //
  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: tablet.tablet_name,
    image: tablet.tablet_img,
    description: tablet.tablet_des || `Apple - ${tablet.tablet_name} tại 7Teck`,
    sku: tablet._id,
    brand: {
      '@type': 'Brand',
      name: 'Apple',
    },
    offers: {
      '@type': 'Offer',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/may-tinh-bang/${slugify(tablet.tablet_name)}/${tablet._id}`,
      priceCurrency: 'VND',
      price: tablet.tablet_price.toString(),
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <>
      <Head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </Head>
      <ClientTabletDetailPage tablet={tablet} />
    </>
  );
}
