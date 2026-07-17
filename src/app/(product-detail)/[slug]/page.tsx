import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { StructuredData } from '@/app/(SEO)/metadata/structuredData';
import ClientPhoneDetailPage from '@/app/(product)/dien-thoai/[slug]/[id]/ClientPhoneDetailPage';
import ClientMacbookDetailPage from '@/app/(product)/macbook/[slug]/[id]/ClientMacbookDetailPage';
import ClientTabletDetailPage from '@/app/(product)/may-tinh-bang/[slug]/[id]/ClientTabletDetailPage';
import ClientWindowsDetailPage from '@/app/(product)/windows/[slug]/[id]/ClientWindowsDetailPage';

import { IPhone } from '@/types/type/products/phone/phone';
import { IMacbook } from '@/types/type/products/macbook/macbook';
import { ITablet } from '@/types/type/products/tablet/tablet';
import { IWindows } from '@/types/type/products/windows/windows';
import { JsonLdProduct } from '@/types/types/seo/jsonld';
import { generatePhoneMetadata } from '@/app/(SEO)/metadata/id/phoneMetadata';
import { generateMacbookMetadata } from '@/app/(SEO)/metadata/id/macbookMetadata';
import { generateTabletMetadata } from '@/app/(SEO)/metadata/id/tabletMetadata';
import { generateWindowsMetadata } from '@/app/(SEO)/metadata/id/windowsMetadata';
import { getPhoneBySlug } from '@/services/products/phoneService';
import { getMacbookBySlug } from '@/services/products/macbookService';
import { getTabletBySlug } from '@/services/products/tabletService';
import { getWindowsBySlug } from '@/services/products/windowsService';

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

// NORMALIZERS
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

function normalizeMacbook(mac: IMacbook): NormalizedProduct {
  return {
    _id: mac._id,
    slug: mac.macbook_slug,
    name: mac.macbook_name,
    img: mac.macbook_thumbnail?.[0] || mac.macbook_img,
    price: mac.macbook_price,
    description: mac.macbook_des,
    brand: 'Apple',
  };
}

function normalizeTablet(tablet: ITablet): NormalizedProduct {
  return {
    _id: tablet._id,
    slug: tablet.tablet_slug,
    name: tablet.tablet_name,
    img: tablet.tablet_thumbnail?.[0] || tablet.tablet_img,
    price: tablet.tablet_price,
    description: tablet.tablet_des,
  };
}

function normalizeWindows(win: IWindows): NormalizedProduct {
  return {
    _id: win._id,
    slug: win.windows_slug,
    name: win.windows_name,
    img: win.windows_thumbnail?.[0] || win.windows_img,
    price: win.windows_price,
    description: win.windows_des,
  };
}

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

// RESOLVER — dò tuần tự qua 4 loại, trả về cái đầu khớp slug
async function resolveProduct(slug: string): Promise<ProductUnion | null> {
  const normalizedSlug = slug.trim().toLowerCase();

  const [phone, macbook, tablet, windows] = await Promise.all([
    getPhoneBySlug(normalizedSlug),
    getMacbookBySlug(normalizedSlug),
    getTabletBySlug(normalizedSlug),
    getWindowsBySlug(normalizedSlug),
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

  // MACBOOK
  if (macbook) {
    return {
      type: 'macbook',
      product: normalizeMacbook(macbook),
      raw: macbook,
      metadata: generateMacbookMetadata(macbook),
      jsonLd: {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: macbook.macbook_name,
        image: macbook.macbook_thumbnail?.[0] || macbook.macbook_img,
        description: macbook.macbook_des || macbook.macbook_name,
        sku: macbook._id,
        brand: { '@type': 'Brand', name: 'Apple' },
        offers: {
          '@type': 'Offer',
          url: `${process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')}/${macbook.macbook_slug}`,
          priceCurrency: 'VND',
          price: macbook.macbook_price,
          availability: 'https://schema.org/InStock',
        },
      },
    };
  }

  // TABLET
  if (tablet) {
    return {
      type: 'tablet',
      product: normalizeTablet(tablet),
      raw: tablet,
      metadata: generateTabletMetadata(tablet),
      jsonLd: {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: tablet.tablet_name,
        image: tablet.tablet_thumbnail?.[0] || tablet.tablet_img,
        description: tablet.tablet_des || tablet.tablet_name,
        sku: tablet._id,
        offers: {
          '@type': 'Offer',
          url: `${process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')}/${tablet.tablet_slug}`,
          priceCurrency: 'VND',
          price: tablet.tablet_price,
          availability: 'https://schema.org/InStock',
        },
      },
    };
  }

  // WINDOWS
  if (windows) {
    return {
      type: 'windows',
      product: normalizeWindows(windows),
      raw: windows,
      metadata: generateWindowsMetadata(windows),
      jsonLd: {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: windows.windows_name,
        image: windows.windows_thumbnail?.[0] || windows.windows_img,
        description: windows.windows_des || windows.windows_name,
        sku: windows._id,
        offers: {
          '@type': 'Offer',
          url: `${process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')}/${windows.windows_slug}`,
          priceCurrency: 'VND',
          price: windows.windows_price,
          availability: 'https://schema.org/InStock',
        },
      },
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

    case 'macbook':
      return (
        <>
          <StructuredData data={data.jsonLd} />
          <ClientMacbookDetailPage mac={data.raw} />
        </>
      );

    case 'tablet':
      return (
        <>
          <StructuredData data={data.jsonLd} />
          <ClientTabletDetailPage tablet={data.raw} />
        </>
      );

    case 'windows':
      return (
        <>
          <StructuredData data={data.jsonLd} />
          <ClientWindowsDetailPage win={data.raw} />
        </>
      );

    default:
      return null;
  }
}

// ISR
export const revalidate = 18000;
