import ClientMacbookPage from './ClientMacbookPage';
import { getGroupedMacbook } from '@/services/products/macbookService';
import ErrorLoading from '@/components/orther/error/ErrorLoading';
import { Metadata } from 'next';
import { buildListMetadata, buildBreadcrumbJsonLd } from '@/app/(SEO)/lib/listMetadata';

export const metadata: Metadata = buildListMetadata({
  path: '/macbook',
  title: 'MacBook chính hãng, giá tốt, trả góp 0% | 7Teck.vn',
  description:
    'Mua MacBook chính hãng giá tốt tại 7Teck.vn. Đầy đủ MacBook Air, MacBook Pro chip M1/M2/M3... Trả góp 0%, bảo hành uy tín, giao hàng nhanh toàn quốc.',
  keywords: ['MacBook chính hãng', 'MacBook Air', 'MacBook Pro', 'MacBook M3', 'mua MacBook online', 'trả góp 0%', '7Teck.vn'],
});

const breadcrumbJsonLd = buildBreadcrumbJsonLd([
  { name: 'Trang chủ', path: '' },
  { name: 'MacBook', path: '/macbook' },
]);

export default async function MacbookPage() {
  const groupedMacbook = await getGroupedMacbook();
  if (!groupedMacbook) {
    return <ErrorLoading />;
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <ClientMacbookPage groupedMacbook={groupedMacbook} />
    </>
  );
}
