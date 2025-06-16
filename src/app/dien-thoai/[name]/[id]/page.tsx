import { getPhoneById } from '@/services/products/phoneService';
import { PageProps } from '@/types/type/pages/page-props';
import { IPhone } from '@/types/type/phone/phone';
import Head from 'next/head';
import React from 'react';
import ClientPhoneDetailPage from './ClientPhoneDetailPage';
import { slugify } from '@/utils/slugify';

export default async function PhoneDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const phone: IPhone | null = await getPhoneById(id);

  if (!phone) {
    return <div className="mt-10 text-center">Không có dữ liệu.</div>;
  }
  //
  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: phone.name,
    image: phone.img,
    description: phone.des || `Apple - ${phone.name} tại 7Teck`,
    sku: phone._id,
    brand: {
      '@type': 'Brand',
      name: 'Apple',
    },
    offers: {
      '@type': 'Offer',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/nam/${slugify(phone.name)}/${phone._id}`,
      priceCurrency: 'VND',
      price: phone.price.toString(),
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <>
      <Head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </Head>
      <ClientPhoneDetailPage phone={phone} />
    </>
  );
}
