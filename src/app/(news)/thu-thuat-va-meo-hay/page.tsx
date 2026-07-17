import React from 'react';
import { getAllTipsAndTricks } from '@/services/postService';
import ClientTipsAndTricksPage from './ClientTipsAndTricksPage';
import ErrorLoading from '@/components/orther/error/ErrorLoading';
import { Metadata } from 'next';
import { buildListMetadata, buildBreadcrumbJsonLd } from '@/app/(SEO)/lib/listMetadata';

export const metadata: Metadata = buildListMetadata({
  path: '/thu-thuat-va-meo-hay',
  title: 'Thủ thuật & mẹo hay công nghệ | 7Teck.vn',
  description:
    'Tổng hợp thủ thuật và mẹo hay về điện thoại, máy tính bảng, laptop, MacBook giúp bạn dùng thiết bị hiệu quả hơn tại 7Teck.vn.',
  keywords: ['thủ thuật công nghệ', 'mẹo hay điện thoại', 'mẹo laptop', 'thủ thuật iPhone', '7Teck.vn'],
});

const breadcrumbJsonLd = buildBreadcrumbJsonLd([
  { name: 'Trang chủ', path: '' },
  { name: 'Thủ thuật và mẹo hay', path: '/thu-thuat-va-meo-hay' },
]);

export default async function TipsAndTricksPage() {
  const tricks = await getAllTipsAndTricks();
  if (!tricks) {
    return <ErrorLoading />;
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <ClientTipsAndTricksPage tricks={tricks} />
    </>
  );
}
