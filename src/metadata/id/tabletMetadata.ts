import { Metadata } from 'next';
import { ITablet } from '@/types/type/products/tablet/tablet';
import { slugify } from '@/utils/slugify';

export function generateTabletMetadata(tablet: ITablet): Metadata {
  const slug = slugify(tablet.tablet_name);
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/may-tinh-bang/${slug}/${tablet._id}`;

  const title = `${tablet.tablet_name} - Máy Tính Bảng Chính Hãng, Giá Tốt tại 7Teck.vn`;
  const description = `Khám phá máy tính bảng ${tablet.tablet_name} chính hãng, giá tốt tại 7Teck.vn. Ưu đãi hấp dẫn, bảo hành uy tín, giao hàng nhanh.`;

  return {
    title,
    description,
    keywords: [
      tablet.tablet_name,
      `${tablet.tablet_name} giá rẻ`,
      `máy tính bảng ${tablet.tablet_name} chính hãng`,
      'mua tablet online',
      '7Teck.vn',
      'giao hàng nhanh',
      'tablet giá tốt 2025',
    ],
    robots: 'index, follow',
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${tablet.tablet_name} - Chính Hãng tại 7Teck.vn`,
      description,
      url,
      siteName: '7Teck.vn',
      images: [
        {
          url: tablet.tablet_img,
          width: 1200,
          height: 630,
          alt: `${tablet.tablet_name} - Máy tính bảng chính hãng`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [tablet.tablet_img],
    },
  };
}
