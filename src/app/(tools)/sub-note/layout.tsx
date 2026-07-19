import { buildPageMetadata } from '@/app/(SEO)/lib/seo';

export const metadata = buildPageMetadata({
  path: '/sub-note',
  title: 'Sub Note nội bộ | 7Teck.vn',
  description: 'Công cụ quản lý sản phẩm phụ nội bộ.',
  robots: 'noindex, follow',
});

export default function SubNoteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
