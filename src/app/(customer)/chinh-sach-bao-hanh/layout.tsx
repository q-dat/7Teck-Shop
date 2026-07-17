import { buildPageMetadata } from '@/app/(SEO)/lib/seo';

export const metadata = buildPageMetadata({
  path: '/chinh-sach-bao-hanh',
  title: 'Chính sách bảo hành điện thoại, laptop, MacBook | 7Teck.vn',
  description:
    'Chính sách bảo hành chính hãng tại 7Teck.vn: điều kiện bảo hành, thời gian xử lý, quyền lợi khách hàng khi mua điện thoại, máy tính bảng, laptop, MacBook.',
  keywords: ['chính sách bảo hành', 'bảo hành điện thoại', 'bảo hành laptop', 'bảo hành MacBook', '7Teck.vn'],
});

export default function WarrantyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
