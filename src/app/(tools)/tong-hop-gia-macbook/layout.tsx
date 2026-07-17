import { buildPageMetadata } from '@/app/(SEO)/lib/seo';

export const metadata = buildPageMetadata({
  path: '/tong-hop-gia-macbook',
  title: 'Tổng hợp giá MacBook mới nhất từ nhiều nguồn | 7Teck.vn',
  description:
    'Bảng tổng hợp giá MacBook Air, MacBook Pro mới nhất từ nhiều nguồn công nghệ Việt Nam, cập nhật liên tục tại 7Teck.vn. Dễ dàng so sánh và lựa chọn.',
  keywords: ['tổng hợp giá MacBook', 'giá MacBook Air', 'giá MacBook Pro', 'so sánh giá MacBook', '7Teck.vn'],
});

export default function TongHopGiaMacbookLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
