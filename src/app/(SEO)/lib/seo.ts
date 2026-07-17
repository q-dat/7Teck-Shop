import type { Metadata } from 'next';
import { slugify } from '@/utils/slugify';
import { IPost } from '@/types/type/products/post/post';

/**
 * Nguồn chân lý duy nhất cho domain dùng trong SEO (canonical, OG, JSON-LD, sitemap).
 * Ưu tiên biến môi trường, fallback về domain prod.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.7teck.vn').replace(/\/$/, '');

export const SITE_NAME = '7Teck.vn';

/** Ghép URL tuyệt đối từ 1 path tương đối. */
export function absoluteUrl(path = ''): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${p}`;
}

/**
 * URL chuẩn (canonical) của 1 bài viết.
 * PHẢI khớp chính xác với link điều hướng thực tế trong UI:
 *   `/tin-tuc/${encodeURIComponent(slugify(title))}/${_id}`
 * (xem ClientNewsPage / ClientPostSection). Trước đây SEO dùng
 * encodeURIComponent(title) thô -> lệch canonical -> Google index sai.
 */
export function postPath(post: Pick<IPost, '_id' | 'title'>): string {
  const titleSlug = encodeURIComponent(slugify(post.title || ''));
  return `/tin-tuc/${titleSlug}/${post._id}`;
}

export function postUrl(post: Pick<IPost, '_id' | 'title'>): string {
  return absoluteUrl(postPath(post));
}

/** Rút gọn text về mô tả meta an toàn (loại HTML/xuống dòng, cắt ~160 ký tự). */
export function toMetaDescription(raw: string | undefined, max = 160): string {
  if (!raw) return '';
  const clean = raw
    .replace(/<[^>]*>/g, ' ') // bỏ tag HTML nếu content có markup
    .replace(/\s+/g, ' ')
    .trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

export type PageMetaConfig = {
  path: string;
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  /** 'index, follow' (mặc định) hoặc 'noindex, nofollow' cho trang nội bộ. */
  robots?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
};

/**
 * Metadata chuẩn cho MỌI trang (danh sách, chi tiết, tĩnh, bài viết).
 * Sinh đồng bộ canonical + Open Graph + Twitter từ 1 config, đảm bảo
 * Bot GG đọc đúng URL và nội dung. Tránh lệch canonical giữa trang/sitemap.
 */
export function buildPageMetadata(cfg: PageMetaConfig): Metadata {
  const url = absoluteUrl(cfg.path);
  const image = cfg.image || absoluteUrl('/logo.png');
  const robots = cfg.robots ?? 'index, follow';

  const og: Record<string, unknown> = {
    title: cfg.title,
    description: cfg.description,
    url,
    siteName: SITE_NAME,
    images: [{ url: image, width: 1200, height: 630, alt: cfg.title }],
    type: cfg.type ?? 'website',
    locale: 'vi_VN',
  };
  if (cfg.type === 'article') {
    if (cfg.publishedTime) og['publishedTime'] = cfg.publishedTime;
    if (cfg.modifiedTime) og['modifiedTime'] = cfg.modifiedTime;
    if (cfg.section) og['section'] = cfg.section;
  }

  return {
    title: cfg.title,
    description: cfg.description,
    keywords: cfg.keywords,
    robots,
    alternates: { canonical: url },
    openGraph: og as Metadata['openGraph'],
    twitter: {
      card: 'summary_large_image',
      title: cfg.title,
      description: cfg.description,
      images: [image],
    },
  };
}
