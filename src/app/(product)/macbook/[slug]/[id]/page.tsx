export const revalidate = 18000;

import ClientMacbookDetailPage from './ClientMacbookDetailPage';
import { IMacbook } from '@/types/type/products/macbook/macbook';
import { getMacbookWithFallback } from '@/services/products/macbookService';
import { Metadata } from 'next';
import { generateMacbookMetadata } from '@/app/(SEO)/metadata/id/macbookMetadata';
import { StructuredData } from '@/app/(SEO)/metadata/structuredData';
import { SITE_URL, SITE_NAME, absoluteUrl } from '@/app/(SEO)/lib/seo';

type RouteParams = {
  slug: string;
  id: string;
};

export async function generateMetadata({ params }: { params: Promise<RouteParams> }): Promise<Metadata> {
  const { id } = await params;
  const mac: IMacbook | null = await getMacbookWithFallback(id);

  if (!mac) {
    return {
      title: 'Không tìm thấy sản phẩm - 7Teck.vn',
      description: 'Sản phẩm không tồn tại hoặc đã bị xóa.',
      robots: 'noindex, nofollow',
    };
  }

  return generateMacbookMetadata(mac);
}

export default async function MacbookDetailPage({ params }: { params: Promise<RouteParams> }) {
  const { id } = await params;

  const mac: IMacbook | null = await getMacbookWithFallback(id);

  if (!mac) {
    return <div className="mt-10 text-center">Không có dữ liệu.</div>;
  }

  const url = `${SITE_URL}/macbook/${mac.macbook_slug}/${mac._id}`;

  const productJsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: mac.macbook_name,
    image: mac.macbook_thumbnail?.[0] || mac.macbook_img,
    description: mac.macbook_des || mac.macbook_name,
    sku: mac._id,
    brand: { '@type': 'Brand', name: 'Apple' },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'VND',
      price: mac.macbook_price,
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: SITE_NAME },
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'MacBook', item: absoluteUrl('/macbook') },
      { '@type': 'ListItem', position: 3, name: mac.macbook_name, item: url },
    ],
  };

  return (
    <>
      <StructuredData data={productJsonLd} />
      <StructuredData data={breadcrumbJsonLd} />
      <ClientMacbookDetailPage mac={mac} />
    </>
  );
}
