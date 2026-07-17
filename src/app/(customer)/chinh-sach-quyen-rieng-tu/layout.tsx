import { buildPageMetadata } from '@/app/(SEO)/lib/seo';

export const metadata = buildPageMetadata({
  path: '/chinh-sach-quyen-rieng-tu',
  title: 'Chính sách quyền riêng tư | 7Teck.vn',
  description:
    'Chính sách quyền riêng tư của 7Teck.vn: cách chúng tôi thu thập, lưu trữ và bảo vệ thông tin cá nhân khách hàng khi sử dụng website và dịch vụ.',
  keywords: ['chính sách quyền riêng tư', 'bảo mật thông tin', 'quyền riêng tư 7Teck'],
  robots: 'noindex, follow',
});

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
