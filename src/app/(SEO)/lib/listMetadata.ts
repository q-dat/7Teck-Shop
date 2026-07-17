import { Metadata } from 'next';
import { SITE_NAME, SITE_URL, absoluteUrl } from '@/app/(SEO)/lib/seo';

type ListPageConfig = {
  path: string;
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
};

/** Metadata chuẩn cho một trang danh sách (list) — title/description/canonical/OG/twitter. */
export function buildListMetadata(cfg: ListPageConfig): Metadata {
  const url = absoluteUrl(cfg.path);
  const image = cfg.image || absoluteUrl('/logo.png');
  return {
    title: cfg.title,
    description: cfg.description,
    keywords: cfg.keywords,
    robots: 'index, follow',
    alternates: { canonical: url },
    openGraph: {
      title: cfg.title,
      description: cfg.description,
      url,
      siteName: SITE_NAME,
      images: [{ url: image, width: 1200, height: 630, alt: cfg.title }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: cfg.title,
      description: cfg.description,
      images: [image],
    },
  };
}

/** BreadcrumbList JSON-LD từ danh sách [tên, path]. path rỗng = trang chủ. */
export function buildBreadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.path ? absoluteUrl(it.path) : SITE_URL,
    })),
  };
}

/**
 * CollectionPage + ItemList JSON-LD cho trang danh sách sản phẩm/bài viết.
 * products: mảng {name, url, image?} đã build sẵn URL tuyệt đối.
 */
export function buildItemListJsonLd(opts: {
  name: string;
  path: string;
  description?: string;
  items: { name: string; url: string; image?: string }[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: opts.name,
    description: opts.description,
    url: absoluteUrl(opts.path),
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: opts.items.length,
      itemListElement: opts.items.slice(0, 100).map((it, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: it.name,
        url: it.url,
        ...(it.image ? { image: it.image } : {}),
      })),
    },
  };
}
