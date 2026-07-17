import { buildPageMetadata } from '@/app/(SEO)/lib/seo';

export const metadata = buildPageMetadata({
  path: '/q-dat',
  title: 'Đặt trước điện thoại, laptop, MacBook mới nhất | 7Teck.vn',
  description:
    'Đặt trước (pre-order) các mẫu điện thoại, laptop, MacBook mới nhất tại 7Teck.vn. Nhận ưu đãi sớm, giao hàng đầu tiên, hỗ trợ trả góp 0%.',
  keywords: ['đặt trước', 'pre-order', 'đặt gạch', 'điện thoại mới', 'laptop mới', '7Teck.vn'],
});

export default function QDatLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
