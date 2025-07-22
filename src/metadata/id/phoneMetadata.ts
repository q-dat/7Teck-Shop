import { Metadata } from 'next';
import { IPhone } from '@/types/type/products/phone/phone';
import { slugify } from '@/utils/slugify';

export async function generatePhoneMetadata(phone: IPhone): Promise<Metadata> {
  const slug = slugify(phone.name);
  const domain = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.7teck.vn';
  const url = `${domain}/dien-thoai/${slug}/${phone._id}`;

  return {
    title: `${phone.name} - Giá Tốt, Chính Hãng - Mua Ngay tại 7Teck.vn`,
    description: `Khám phá điện thoại ${phone.name} chính hãng, giá tốt tại 7Teck.vn. Ưu đãi hấp dẫn, bảo hành uy tín, giao hàng nhanh toàn quốc.`,
    keywords: [
      phone.name,
      `${phone.name} giá rẻ`,
      `điện thoại ${phone.name} chính hãng`,
      'mua điện thoại online',
      '7Teck.vn',
      'giao hàng nhanh',
      'điện thoại giá tốt 2025',
    ],
    robots: 'index, follow',
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${phone.name} - Chính Hãng tại 7Teck.vn`,
      description: `Mua ngay ${phone.name} chính hãng tại 7Teck.vn. Ưu đãi sốc, bảo hành 1 đổi 1, giao hàng nhanh.`,
      url,
      siteName: '7Teck.vn',
      images: [
        {
          url: phone.img,
          width: 1200,
          height: 630,
          alt: `${phone.name} - Điện thoại chính hãng`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${phone.name} - Chính Hãng tại 7Teck.vn`,
      description: `Mua ngay ${phone.name} chính hãng tại 7Teck.vn. Ưu đãi sốc, giao hàng nhanh.`,
      images: [phone.img],
    },
  };
}
