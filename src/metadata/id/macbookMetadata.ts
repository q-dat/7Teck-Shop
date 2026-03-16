import { Metadata } from 'next';
import { IMacbook } from '@/types/type/products/macbook/macbook';

export function generateMacbookMetadata(mac: IMacbook): Metadata {
  const slug = mac.macbook_slug;
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/macbook/${slug}/${mac._id}`;

  const title = `${mac.macbook_name} - Giá Tốt, Chính Hãng - Mua Ngay tại 7Teck.vn`;
  const description = mac.macbook_des || `Khám phá ${mac.macbook_name} chính hãng tại 7Teck.vn. Ưu đãi hấp dẫn, giao hàng toàn quốc.`;

  return {
    title,
    description,
    keywords: [mac.macbook_name, `${mac.macbook_name} chính hãng`, 'MacBook chính hãng', 'MacBook giá rẻ', 'mua MacBook online', '7Teck.vn'],
    robots: 'index, follow',
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${mac.macbook_name} - Chính Hãng tại 7Teck.vn`,
      description,
      url,
      siteName: '7Teck.vn',
      images: [
        {
          url: mac.macbook_img,
          width: 1200,
          height: 630,
          alt: `${mac.macbook_name} - MacBook chính hãng`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [mac.macbook_img],
    },
  };
}
