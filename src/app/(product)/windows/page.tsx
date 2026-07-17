import ErrorLoading from '@/components/orther/error/ErrorLoading';
import ClientWindowsPage from './ClientWindowsPage';
import { getGroupedWindows } from '@/services/products/windowsService';
import { Metadata } from 'next';
import { buildListMetadata, buildBreadcrumbJsonLd } from '@/app/(SEO)/lib/listMetadata';

export const metadata: Metadata = buildListMetadata({
  path: '/windows',
  title: 'Laptop Windows chính hãng, giá tốt, trả góp 0% | 7Teck.vn',
  description:
    'Mua laptop Windows chính hãng giá rẻ tại 7Teck.vn. Đầy đủ Dell, HP, Asus, Lenovo, MSI... phù hợp văn phòng, học tập, gaming. Trả góp 0%, bảo hành uy tín, giao nhanh toàn quốc.',
  keywords: ['laptop Windows chính hãng', 'laptop giá rẻ', 'Dell', 'HP', 'Asus', 'Lenovo', 'laptop gaming', 'trả góp 0%', '7Teck.vn'],
});

const breadcrumbJsonLd = buildBreadcrumbJsonLd([
  { name: 'Trang chủ', path: '' },
  { name: 'Laptop Windows', path: '/windows' },
]);

export default async function WindowsPage() {
  const groupedWindows = await getGroupedWindows();
  if (!groupedWindows) {
    return <ErrorLoading />;
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <ClientWindowsPage groupedWindows={groupedWindows} />
    </>
  );
}
