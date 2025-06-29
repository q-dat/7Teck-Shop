export const revalidate = 60;

import { PageProps } from '@/types/type/pages/page-props';
import Head from 'next/head';
import React from 'react';
import ClientMacbookDetailPage from './ClientMacbookDetailPage';
import { slugify } from '@/utils/slugify';
import { IMacbook } from '@/types/type/products/macbook/macbook';
import { getMacbookById } from '@/services/products/macbookService';

export default async function MacbookDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const mac: IMacbook | null = await getMacbookById(id);

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
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/nam/${slugify(mac.macbook_name)}/${mac._id}`,
      priceCurrency: 'VND',
      price: mac.macbook_price.toString(),
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <>
      <Head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </Head>
      <ClientMacbookDetailPage mac={mac} />
    </>
  );
}
