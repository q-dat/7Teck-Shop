import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { StructuredData } from '@/metadata/structuredData';
import ClientPhoneDetailPage from '../dien-thoai/[slug]/[id]/ClientPhoneDetailPage';
// import ClientMacbookDetailPage from '@/components/product/macbook/ClientMacbookDetailPage';
// import ClientTabletDetailPage from '@/components/product/tablet/ClientTabletDetailPage';
// import ClientWindowsDetailPage from '@/components/product/windows/ClientWindowsDetailPage';
import { IPhone } from '@/types/type/products/phone/phone';
import { IMacbook } from '@/types/type/products/macbook/macbook';
import { ITablet } from '@/types/type/products/tablet/tablet';
import { IWindows } from '@/types/type/products/windows/windows';
import { JsonLdProduct } from '@/types/types/seo/jsonld';
import { generatePhoneMetadata } from '@/metadata/id/phoneMetadata';
import { getPhoneBySlug } from '@/services/products/phoneService';
// import { getMacbookBySlug } from '@/services/products/macbookService';
// import { getTabletBySlug } from '@/services/products/tabletService';
// import { getWindowsBySlug } from '@/services/products/windowsService';

// TYPES
type RouteParams = {
  slug: string;
};

// Normalized model (quan trọng nhất)
type NormalizedProduct = {
  _id: string;
  slug: string;
  name: string;
  img: string;
  price: number;
  description?: string;
  brand?: string;
};

// Union chuẩn
type ProductUnion =
  | {
      type: 'phone';
      product: NormalizedProduct;
      raw: IPhone;
      metadata: Metadata;
      jsonLd: JsonLdProduct;
    }
  | {
      type: 'macbook';
      product: NormalizedProduct;
      raw: IMacbook;
      metadata: Metadata;
      jsonLd: JsonLdProduct;
    }
  | {
      type: 'tablet';
      product: NormalizedProduct;
      raw: ITablet;
      metadata: Metadata;
      jsonLd: JsonLdProduct;
    }
  | {
      type: 'windows';
      product: NormalizedProduct;
      raw: IWindows;
      metadata: Metadata;
      jsonLd: JsonLdProduct;
    };

// NORMALIZER
function normalizePhone(phone: IPhone): NormalizedProduct {
  return {
    _id: phone._id,
    slug: phone.slug,
    name: phone.name,
    img: phone.thumbnail?.[0] || phone.img,
    price: phone.price,
    description: phone.des,
    brand: phone.phone_catalog_id?.design_and_material?.brand,
  };
}

//
// function normalizeMacbook(mac: IMacbook): NormalizedProduct {
//   return {
//     _id: mac._id,
//     slug: mac.macbook_slug,
//     name: mac.macbook_name,
//     img: mac.macbook_img,
//     price: mac.macbook_price,
//     description: mac.macbook_des,
//   };
// }

// JSON-LD
function buildPhoneJsonLd(phone: IPhone): JsonLdProduct {
  const domain = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
  const url = `${domain}/${phone.slug}`;

  return {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: phone.name,
    image: phone.thumbnail?.[0] || phone.img,
    description: phone.des || phone.name,
    sku: phone._id,
    brand: {
      '@type': 'Brand',
      name: phone.phone_catalog_id?.design_and_material?.brand || '7Teck',
    },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'VND',
      price: phone.price,
      availability: 'https://schema.org/InStock',
    },
  };
}

// RESOLVER
async function resolveProduct(slug: string): Promise<ProductUnion | null> {
  const normalizedSlug = slug.trim().toLowerCase();

  const [phone /*, macbook, tablet, windows */] = await Promise.all([
    getPhoneBySlug(normalizedSlug),
    // getMacbookBySlug(normalizedSlug),
    // getTabletBySlug(normalizedSlug),
    // getWindowsBySlug(normalizedSlug),
  ]);

  // PHONE
  if (phone) {
    return {
      type: 'phone',
      product: normalizePhone(phone),
      raw: phone,
      metadata: generatePhoneMetadata(phone),
      jsonLd: buildPhoneJsonLd(phone),
    };
  }

  return null;
}

// SEO
export async function generateMetadata({ params }: { params: Promise<RouteParams> }): Promise<Metadata> {
  const { slug } = await params;

  const data = await resolveProduct(slug);

  if (!data) {
    return {
      title: 'Không tìm thấy sản phẩm - 7Teck.vn',
      description: 'Sản phẩm không tồn tại hoặc đã bị xóa.',
      robots: 'noindex, nofollow',
    };
  }

  const domain = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');

  return {
    ...data.metadata,
    alternates: {
      canonical: `${domain}/${data.product.slug}`,
    },
  };
}

// PAGE
export default async function ProductDetailFromSlug({ params }: { params: Promise<RouteParams> }) {
  const { slug } = await params;

  const data = await resolveProduct(slug);

  if (!data) {
    return <div className="mt-10 text-center">Không tìm thấy sản phẩm.</div>;
  }

  // slug chuẩn SEO
  if (data.product.slug !== slug) {
    redirect(`/${data.product.slug}`);
  }

  switch (data.type) {
    case 'phone':
      return (
        <>
          <StructuredData data={data.jsonLd} />
          <ClientPhoneDetailPage phone={data.raw} />
        </>
      );

    // case 'macbook':
    //   return <ClientMacbookDetailPage mac={data.raw} />;

    default:
      return null;
  }
}

// ISR
export const revalidate = 18000;
