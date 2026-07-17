import { buildPageMetadata } from '@/app/(SEO)/lib/seo';

export const metadata = buildPageMetadata({
  path: '/dieu-khoan-dich-vu',
  title: 'Điều khoản dịch vụ | 7Teck.vn',
  description:
    'Điều khoản dịch vụ của 7Teck.vn: quy định mua bán, đặt hàng, vận chuyển, đổi trả và trách nhiệm các bên khi sử dụng website và dịch vụ của chúng tôi.',
  keywords: ['điều khoản dịch vụ', 'điều khoản mua bán', 'quy định 7Teck'],
  robots: 'noindex, follow',
});

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
