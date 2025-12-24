import { Metadata } from 'next';
import { IPhone } from '@/types/type/products/phone/phone';
import { slugify } from '@/utils/slugify';

export function generatePhoneMetadata(phone: IPhone): Metadata {
  const slug = slugify(phone.name);
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/dien-thoai/${slug}/${phone._id}`;

  // Title thương mại, không nhồi keyword
  const title = `${phone.name} chính hãng, giá tốt | 7Teck.vn`;

  // Template mô tả chuẩn SEO 2025 (điện thoại)
  const descriptionTemplates: readonly ((name: string) => string)[] = [
    (name) => `${name} chính hãng tại 7Teck.vn, giá tốt, bảo hành rõ ràng, giao hàng nhanh toàn quốc.`,

    (name) => `Mua ${name} chính hãng, đầy đủ phụ kiện, hỗ trợ giao nhanh và bảo hành uy tín tại 7Teck.vn.`,

    (name) => `${name} mới 100%, thiết kế hiện đại, hiệu năng ổn định, bán chính hãng tại 7Teck.vn.`,

    (name) => `7Teck.vn cung cấp ${name} chính hãng, giá cạnh tranh, hỗ trợ giao hàng toàn quốc.`,

    (name) => `${name} phù hợp học tập, làm việc và giải trí, mua chính hãng tại 7Teck.vn.`,

    (name) => `Sở hữu ngay ${name} chính hãng với mức giá tốt, bảo hành minh bạch tại 7Teck.vn.`,
  ] as const;

  // Deterministic selection theo _id (SEO-safe)
  let hash = 0;
  for (let i = 0; i < phone._id.length; i++) {
    hash = (hash << 5) - hash + phone._id.charCodeAt(i);
    hash |= 0;
  }

  const description = descriptionTemplates[Math.abs(hash) % descriptionTemplates.length](phone.name);

  return {
    title,
    description,
    keywords: [phone.name, `${phone.name} giá rẻ`, `điện thoại ${phone.name} chính hãng`, 'mua điện thoại online', '7Teck.vn'],
    robots: 'index, follow',
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${phone.name} chính hãng tại 7Teck.vn`,
      description,
      url,
      siteName: '7Teck.vn',
      images: [
        {
          url: phone.img,
          width: 1200,
          height: 630,
          alt: `${phone.name} chính hãng`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [phone.img],
    },
  };
}
