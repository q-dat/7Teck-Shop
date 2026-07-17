import { buildPageMetadata } from '@/app/(SEO)/lib/seo';

export const metadata = buildPageMetadata({
  path: '/thanh-toan',
  title: 'Thanh toán & đặt hàng điện thoại, laptop, MacBook | 7Teck.vn',
  description:
    'Hướng dẫn thanh toán và đặt hàng tại 7Teck.vn: cà thẻ, chuyển khoản, trả góp 0%, giao hàng tận nơi trên toàn quốc. Nhanh chóng và bảo mật.',
  keywords: ['thanh toán', 'đặt hàng', 'trả góp 0%', 'mua trả góp', 'giao hàng tận nơi', '7Teck.vn'],
  robots: 'noindex, follow',
});

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
