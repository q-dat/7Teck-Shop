import { buildPageMetadata } from '@/app/(SEO)/lib/seo';

export const metadata = buildPageMetadata({
  path: '/ghi-chu',
  title: 'Ghi chú nội bộ',
  description: 'Công cụ ghi chú nội bộ quản lý sản phẩm.',
  robots: 'noindex, follow',
});

export default function GhiChuLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
