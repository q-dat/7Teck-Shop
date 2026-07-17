import ClientTabletPage from './ClientTabletPage';
import ErrorLoading from '@/components/orther/error/ErrorLoading';
import { getGroupedTablets } from '@/services/products/tabletService';
import { Metadata } from 'next';
import { buildListMetadata, buildBreadcrumbJsonLd } from '@/app/(SEO)/lib/listMetadata';

export const metadata: Metadata = buildListMetadata({
  path: '/may-tinh-bang',
  title: 'Máy tính bảng chính hãng, giá tốt, trả góp 0% | 7Teck.vn',
  description:
    'Mua máy tính bảng (tablet) chính hãng giá rẻ tại 7Teck.vn. Đầy đủ iPad, Samsung Galaxy Tab, Xiaomi Pad... Trả góp 0%, bảo hành uy tín, giao hàng nhanh toàn quốc.',
  keywords: ['máy tính bảng chính hãng', 'tablet giá rẻ', 'mua iPad', 'Galaxy Tab', 'Xiaomi Pad', 'trả góp 0%', '7Teck.vn'],
});

const breadcrumbJsonLd = buildBreadcrumbJsonLd([
  { name: 'Trang chủ', path: '' },
  { name: 'Máy tính bảng', path: '/may-tinh-bang' },
]);

export default async function TabletPage() {
  const groupedTablets = await getGroupedTablets();
  if (!groupedTablets) {
    return <ErrorLoading />;
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <ClientTabletPage groupedTablets={groupedTablets} />
    </>
  );
}
