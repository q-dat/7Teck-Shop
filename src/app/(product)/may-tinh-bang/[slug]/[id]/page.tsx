export const revalidate = 18000;

import { ITablet } from '@/types/type/products/tablet/tablet';
import { getTabletWithFallback } from '@/services/products/tabletService';
import ClientTabletDetailPage from './ClientTabletDetailPage';
import { Metadata } from 'next';
import { generateTabletMetadata } from '@/app/(SEO)/metadata/id/tabletMetadata';
import { StructuredData } from '@/app/(SEO)/metadata/structuredData';
import { SITE_URL, SITE_NAME, absoluteUrl } from '@/app/(SEO)/lib/seo';

type RouteParams = {
  slug: string;
  id: string;
};

export async function generateMetadata({ params }: { params: Promise<RouteParams> }): Promise<Metadata> {
  const { id } = await params;
  const tablet: ITablet | null = await getTabletWithFallback(id);

  if (!tablet) {
    return {
      title: 'Không tìm thấy sản phẩm - 7Teck.vn',
      description: 'Sản phẩm không tồn tại hoặc đã bị xóa.',
      robots: 'noindex, nofollow',
    };
  }

  return generateTabletMetadata(tablet);
}

export default async function TabletDetailPage({ params }: { params: Promise<RouteParams> }) {
  const { id } = await params;

  const tablet: ITablet | null = await getTabletWithFallback(id);

  if (!tablet) {
    return <div className="mt-10 text-center">Không có dữ liệu.</div>;
  }

  const url = `${SITE_URL}/${tablet.tablet_slug}`;

  const productJsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: tablet.tablet_name,
    image: tablet.tablet_thumbnail?.[0] || tablet.tablet_img,
    description: tablet.tablet_des || tablet.tablet_name,
    sku: tablet._id,
    brand: { '@type': 'Brand', name: SITE_NAME },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'VND',
      price: tablet.tablet_price,
      availability: 'https://schema.org/InStock',
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Máy tính bảng', item: absoluteUrl('/may-tinh-bang') },
      { '@type': 'ListItem', position: 3, name: tablet.tablet_name, item: url },
    ],
  };

  return (
    <>
      <StructuredData data={productJsonLd} />
      <StructuredData data={breadcrumbJsonLd} />
      <ClientTabletDetailPage tablet={tablet} />
    </>
  );
}
