import { getGroupedPhones } from '@/services/products/phoneService';
import ClientPhonePage from './ClientPhonePage';
import ErrorLoading from '@/components/orther/error/ErrorLoading';
import { Metadata } from 'next';
import { buildListMetadata, buildBreadcrumbJsonLd } from '@/app/(SEO)/lib/listMetadata';

export const metadata: Metadata = buildListMetadata({
  path: '/dien-thoai',
  title: 'Điện thoại chính hãng, giá tốt, trả góp 0% | 7Teck.vn',
  description:
    'Mua điện thoại, smartphone chính hãng giá rẻ tại 7Teck.vn. Đầy đủ iPhone, Samsung, Xiaomi, OPPO... Trả góp 0%, bảo hành uy tín, giao hàng nhanh toàn quốc.',
  keywords: ['điện thoại chính hãng', 'smartphone giá rẻ', 'mua điện thoại online', 'iPhone', 'Samsung', 'Xiaomi', 'trả góp 0%', '7Teck.vn'],
});

const breadcrumbJsonLd = buildBreadcrumbJsonLd([
  { name: 'Trang chủ', path: '' },
  { name: 'Điện thoại', path: '/dien-thoai' },
]);

export default async function PhonePage() {
  const groupedPhones = await getGroupedPhones();
  if (!groupedPhones) {
    return <ErrorLoading />;
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <ClientPhonePage groupedPhones={groupedPhones} />
    </>
  );
}
