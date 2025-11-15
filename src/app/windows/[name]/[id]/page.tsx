export const revalidate = 18000;

import { PageProps } from '@/types/type/pages/page-props';
import React from 'react';
import { slugify } from '@/utils/slugify';
import ClientWindowsDetailPage from './ClientWindowsDetailPage';
import { IWindows } from '@/types/type/products/windows/windows';
import { getWindowsById, logWindowsCache } from '@/services/products/windowsService';
import { generateWindowsMetadata } from '@/metadata/id/windowsMetadata';
import { StructuredData } from '@/metadata/structuredData';

// SEO metadata generation for windows detail page
export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const win: IWindows | null = await getWindowsById(id);

  if (!win) {
    return {
      title: 'Không tìm thấy sản phẩm - 7Teck.vn',
      description: 'Sản phẩm không tồn tại hoặc đã bị xóa. Khám phá thêm sản phẩm khác tại 7Teck.vn.',
      robots: 'noindex, nofollow',
    };
  }

  return generateWindowsMetadata(win);
}

export default async function WindowsDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const win: IWindows | null = await getWindowsById(id);
  logWindowsCache();

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
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/windows/${slugify(win.windows_name)}/${win._id}`,
      priceCurrency: 'VND',
      price: win.windows_price.toString(),
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <>
      <StructuredData data={jsonLd} />
      <ClientWindowsDetailPage win={win} />
    </>
  );
}
