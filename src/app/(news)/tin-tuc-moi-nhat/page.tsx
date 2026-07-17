import React from 'react';
import { getAllNews } from '@/services/postService';
import ClientNewsPage from './ClientNewsPage';
import ErrorLoading from '@/components/orther/error/ErrorLoading';
import { Metadata } from 'next';
import { buildListMetadata, buildBreadcrumbJsonLd } from '@/app/(SEO)/lib/listMetadata';

export const metadata: Metadata = buildListMetadata({
  path: '/tin-tuc-moi-nhat',
  title: 'Tin tức công nghệ mới nhất | 7Teck.vn',
  description:
    'Cập nhật tin tức công nghệ mới nhất: điện thoại, máy tính bảng, laptop, MacBook, đánh giá sản phẩm và xu hướng công nghệ tại 7Teck.vn.',
  keywords: ['tin tức công nghệ', 'tin công nghệ mới nhất', 'đánh giá điện thoại', 'đánh giá laptop', '7Teck.vn'],
});

const breadcrumbJsonLd = buildBreadcrumbJsonLd([
  { name: 'Trang chủ', path: '' },
  { name: 'Tin tức mới nhất', path: '/tin-tuc-moi-nhat' },
]);

export default async function NewsPage() {
  const news = await getAllNews();
  if (!news) {
    return <ErrorLoading />;
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <ClientNewsPage news={news} />
    </>
  );
}
