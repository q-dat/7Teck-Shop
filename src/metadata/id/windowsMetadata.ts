import { Metadata } from 'next';
import { IWindows } from '@/types/type/products/windows/windows';
import { slugify } from '@/utils/slugify';

export function generateWindowsMetadata(win: IWindows): Metadata {
  const slug = slugify(win.windows_name);
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/windows/${slug}/${win._id}`;

  const title = `${win.windows_name} - Laptop Windows Chính Hãng, Giá Tốt tại 7Teck.vn`;
  const description = `Mua ${win.windows_name} chính hãng, giá ưu đãi tại 7Teck.vn. Bảo hành uy tín, giao hàng nhanh toàn quốc.`;

  return {
    title,
    description,
    keywords: [
      win.windows_name,
      `${win.windows_name} giá rẻ`,
      `laptop ${win.windows_name} chính hãng`,
      'mua laptop windows online',
      '7Teck.vn',
      'giao hàng nhanh',
      'laptop giá tốt 2025',
    ],
    robots: 'index, follow',
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${win.windows_name} - Chính Hãng tại 7Teck.vn`,
      description,
      url,
      siteName: '7Teck.vn',
      images: [
        {
          url: win.windows_img,
          width: 1200,
          height: 630,
          alt: `${win.windows_name} - Laptop chính hãng`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [win.windows_img],
    },
  };
}
