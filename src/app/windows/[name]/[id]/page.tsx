import { PageProps } from '@/types/type/pages/page-props';
import Head from 'next/head';
import React from 'react';
import { slugify } from '@/utils/slugify';
import ClientWindowsDetailPage from './ClientWindowsDetailPage';
import { IWindows } from '@/types/type/windows/windows';
import { getWindowsById } from '@/services/products/windowsService';

export default async function WindowsDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const win: IWindows | null = await getWindowsById(id);

  if (!win) {
    return <div className="mt-10 text-center">Không có dữ liệu.</div>;
  }
  //
  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: win.windows_name,
    image: win.windows_img,
    description: win.windows_des || `Apple - ${win.windows_name} tại 7Teck`,
    sku: win._id,
    brand: {
      '@type': 'Brand',
      name: 'Apple',
    },
    offers: {
      '@type': 'Offer',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/nam/${slugify(win.windows_name)}/${win._id}`,
      priceCurrency: 'VND',
      price: win.windows_price.toString(),
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <>
      <Head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </Head>
      <ClientWindowsDetailPage win={win} />
    </>
  );
}
