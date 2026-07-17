import { buildPageMetadata } from '@/app/(SEO)/lib/seo';

export const metadata = buildPageMetadata({
  path: '/ghi-chu',
  title: 'Ghi chú & so sánh cấu hình thiết bị | 7Teck.vn',
  description:
    'Công cụ ghi chú và so sánh cấu hình điện thoại, máy tính bảng, laptop, MacBook tại 7Teck.vn. Lưu ý nhanh, đối chiếu thông số trước khi mua.',
  keywords: ['ghi chú', 'so sánh cấu hình', 'đối chiếu điện thoại', 'công cụ 7Teck'],
  robots: 'noindex, follow',
});

export default function GhiChuLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
