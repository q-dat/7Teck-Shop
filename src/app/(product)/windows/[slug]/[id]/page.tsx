export const revalidate = 18000;

import ClientWindowsDetailPage from './ClientWindowsDetailPage';
import { IWindows } from '@/types/type/products/windows/windows';
import { getWindowsWithFallback } from '@/services/products/windowsService';
import { Metadata } from 'next';
import { generateWindowsMetadata } from '@/app/(SEO)/metadata/id/windowsMetadata';
import { StructuredData } from '@/app/(SEO)/metadata/structuredData';
import { SITE_URL, SITE_NAME, absoluteUrl } from '@/app/(SEO)/lib/seo';

type RouteParams = {
  slug: string;
  id: string;
};

export async function generateMetadata({ params }: { params: Promise<RouteParams> }): Promise<Metadata> {
  const { id } = await params;
  const win: IWindows | null = await getWindowsWithFallback(id);

  if (!win) {
    return {
      title: 'Không tìm thấy sản phẩm - 7Teck.vn',
      description: 'Sản phẩm không tồn tại hoặc đã bị xóa.',
      robots: 'noindex, nofollow',
    };
  }

  return generateWindowsMetadata(win);
}

export default async function WindowsDetailPage({ params }: { params: Promise<RouteParams> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const win: IWindows | null = await getWindowsWithFallback(id);

  if (!win) {
    return <div className="mt-10 text-center">Không có dữ liệu.</div>;
  }

  const url = `${SITE_URL}/${win.windows_slug}`;

  const productJsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: win.windows_name,
    image: win.windows_thumbnail?.[0] || win.windows_img,
    description: win.windows_des || win.windows_name,
    sku: win._id,
    brand: { '@type': 'Brand', name: SITE_NAME },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'VND',
      price: win.windows_price,
      availability: 'https://schema.org/InStock',
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Laptop Windows', item: absoluteUrl('/windows') },
      { '@type': 'ListItem', position: 3, name: win.windows_name, item: url },
    ],
  };

  return (
    <>
      <StructuredData data={productJsonLd} />
      <StructuredData data={breadcrumbJsonLd} />
      <ClientWindowsDetailPage win={win} />
    </>
  );
}
