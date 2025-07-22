export const revalidate = 60;

import { getPhoneById } from '@/services/products/phoneService';
import { PageProps } from '@/types/type/pages/page-props';
import { IPhone } from '@/types/type/products/phone/phone';
import ClientPhoneDetailPage from './ClientPhoneDetailPage';
import { slugify } from '@/utils/slugify';
import { generatePhoneMetadata } from '@/metadata/id/phoneMetadata';
import { StructuredData } from '@/metadata/structuredData';

// SEO metadata generation for phone detail page
export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const phone: IPhone | null = await getPhoneById(id);

  if (!phone) {
    return {
      title: 'Không tìm thấy sản phẩm - 7Teck.vn',
      description: 'Sản phẩm không tồn tại hoặc đã bị xóa. Khám phá thêm sản phẩm khác tại 7Teck.vn.',
      robots: 'noindex, nofollow',
    };
  }

  return generatePhoneMetadata(phone);
}

export default async function PhoneDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const phone: IPhone | null = await getPhoneById(id);

  if (!phone) {
    return <div className="mt-10 text-center">Không có dữ liệu.</div>;
  }
  //
  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: phone.name,
    image: phone.img,
    description: phone.des || `Apple - ${phone.name} tại 7Teck`,
    sku: phone._id,
    brand: {
      '@type': 'Brand',
      name: 'Apple',
    },
    offers: {
      '@type': 'Offer',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/dien-thoai/${slugify(phone.name)}/${phone._id}`,
      priceCurrency: 'VND',
      price: phone.price.toString(),
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <>
      {/* <Head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </Head> */}
      <StructuredData data={jsonLd} />
      <ClientPhoneDetailPage phone={phone} />
    </>
  );
}
