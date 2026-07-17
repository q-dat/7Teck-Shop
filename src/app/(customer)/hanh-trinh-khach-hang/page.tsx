import ClientGalleryPage from './ClientGalleryPage';
import { getAllGallerys } from '@/services/galleryService';
import ErrorLoading from '@/components/orther/error/ErrorLoading';
import { buildPageMetadata } from '@/app/(SEO)/lib/seo';

export const metadata = buildPageMetadata({
  path: '/hanh-trinh-khach-hang',
  title: 'Hành trình cùng khách hàng | 7Teck.vn',
  description:
    'Hình ảnh thực tế những trải nghiệm và phản hồi của khách hàng khi mua sắm điện thoại, laptop, MacBook tại 7Teck.vn. Uy tín - Tận tâm - Trọn vẹn.',
  keywords: ['hành trình khách hàng', 'đánh giá 7Teck', 'khách hàng 7Teck.vn', 'trải nghiệm mua hàng'],
});

export default async function GalleryPage() {
  const galleries = await getAllGallerys();
  if (!galleries) {
    return <ErrorLoading />;
  }
  return <ClientGalleryPage galleries={galleries} />;
}
