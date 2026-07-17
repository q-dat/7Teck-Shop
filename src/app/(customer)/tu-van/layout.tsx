import { buildPageMetadata } from '@/app/(SEO)/lib/seo';

export const metadata = buildPageMetadata({
  path: '/tu-van',
  title: 'Tư vấn mua điện thoại, laptop, MacBook phù hợp | 7Teck.vn',
  description:
    'Đội ngũ tư vấn của 7Teck.vn giúp bạn chọn điện thoại, máy tính bảng, laptop, MacBook phù hợp nhu cầu và ngân sách. Hỗ trợ tận tâm, trả góp 0%.',
  keywords: ['tư vấn mua điện thoại', 'tư vấn laptop', 'tư vấn MacBook', 'hỗ trợ khách hàng 7Teck'],
});

export default function ConsultationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
