import { Metadata } from 'next';
import { IPhone } from '@/types/type/products/phone/phone';
import { slugify } from '@/utils/slugify';

export function generatePhoneMetadata(phone: IPhone): Metadata {
  const slug = slugify(phone.name);
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/dien-thoai/${slug}/${phone._id}`;

  const title = `${phone.name} chính hãng, giá tốt | 7Teck.vn`;

  const descriptionTemplates: readonly ((name: string) => string)[] = [
    (name) => `${name} chính hãng với mức giá hợp lý, thiết kế hiện đại, hiệu năng ổn định và trải nghiệm sử dụng lâu dài.`,

    (name) => `Mua ${name} chính hãng, đầy đủ phụ kiện, chất lượng đảm bảo, phù hợp nhu cầu sử dụng phổ thông và lâu dài.`,

    (name) => `${name} mới 100%, ngoại hình đẹp, vận hành mượt mà trong phân khúc, mức giá dễ tiếp cận.`,

    (name) => `${name} mang lại trải nghiệm sử dụng ổn định, thiết kế gọn gàng, là lựa chọn đáng cân nhắc trong tầm giá.`,

    (name) => `${name} chính hãng, chất lượng đã được kiểm chứng, đáp ứng tốt nhu cầu sử dụng hằng ngày với mức giá hợp lý.`,

    (name) => `Sở hữu ${name} chính hãng với thiết kế hiện đại, hiệu năng ổn định, phù hợp người dùng cần sự bền bỉ.`,

    (name) => `${name} là lựa chọn phù hợp cho người dùng tìm kiếm một chiếc điện thoại ổn định, dễ sử dụng và giá tốt.`,

    (name) => `${name} mang đến sự cân bằng giữa giá bán và trải nghiệm, phù hợp nhiều nhóm người dùng trong phân khúc.`,

    (name) => `Mua ${name} chính hãng để trải nghiệm sự ổn định, độ bền cao và hiệu năng phù hợp nhu cầu sử dụng lâu dài.`,

    (name) => `${name} chính hãng với mức giá cạnh tranh, ngoại hình đẹp, khả năng đáp ứng tốt các tác vụ hằng ngày.`,

    (name) => `${name} được đánh giá cao về độ ổn định và mức giá, phù hợp cho người dùng cần thiết bị sử dụng bền bỉ.`,

    (name) => `Lựa chọn ${name} chính hãng nếu bạn ưu tiên sự ổn định, trải nghiệm mượt mà và chi phí hợp lý.`,

    (name) => `${name} mang lại giá trị sử dụng cao trong tầm giá, thiết kế đẹp và hiệu năng đủ dùng cho đa số nhu cầu.`,

    (name) => `${name} là mẫu điện thoại chính hãng đáng cân nhắc khi tìm kiếm sự ổn định và giá bán hợp lý.`,

    (name) => `Sản phẩm ${name} chính hãng nổi bật với mức giá dễ tiếp cận và trải nghiệm sử dụng ổn định trong phân khúc.`,
  ] as const;

  // ---- Ưu tiên mô tả từ DB nếu có ----
  let description = '';

  if (typeof phone.des === 'string' && phone.des.trim().length > 30) {
    description = phone.des.trim();
  } else {
    let hash = 0;
    for (let i = 0; i < phone._id.length; i++) {
      hash = (hash << 5) - hash + phone._id.charCodeAt(i);
      hash |= 0;
    }

    description = descriptionTemplates[Math.abs(hash) % descriptionTemplates.length](phone.name);
  }

  return {
    title,
    description,
    keywords: [phone.name, `${phone.name} giá tốt`, `điện thoại ${phone.name} chính hãng`, 'mua điện thoại online', '7Teck.vn'],
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
