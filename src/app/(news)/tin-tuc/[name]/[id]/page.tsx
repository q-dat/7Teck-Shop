export const revalidate = 18000;

import { getAllCatalogs, getPostsByCatalog, getPostWithFallback } from '@/services/postService';
import ClientPostDetailPage from './ClientPostDetailPage';
import ErrorLoading from '@/components/orther/error/ErrorLoading';
import { IPost } from '@/types/type/products/post/post';
import { buildPostDetailMetadata } from '@/app/(SEO)/metadata/id/postDetailMetadata';
import { SITE_NAME, SITE_URL, postUrl, absoluteUrl, toMetaDescription } from '@/app/(SEO)/lib/seo';
import { Metadata } from 'next';

type RouteParams = {
  slug: string;
  id: string;
};

// Dùng generateMetadata để dynamic meta
export async function generateMetadata({ params }: { params: Promise<RouteParams> }): Promise<Metadata> {
  const { id } = await params;

  const post: IPost | null = await getPostWithFallback(id);

  if (!post) {
    return {
      title: 'Bài viết không tồn tại - 7Teck',
      description: 'Bài viết bạn tìm không còn hoặc đã bị xóa.',
    };
  }

  return buildPostDetailMetadata(post);
}

export default async function PostDetail({ params }: { params: Promise<RouteParams> }) {
  const { id } = await params;

  const post: IPost | null = await getPostWithFallback(id);
  if (!post) return <ErrorLoading />;

  // Lấy các bài cùng danh mục
  const relatedPosts = await getPostsByCatalog(post.catalog);

  // Loại bỏ chính nó
  const filteredRelated = relatedPosts.filter((p) => p._id !== post._id);

  // Lấy danh mục
  const catalogs = await getAllCatalogs();

  // Lấy danh mục hiện tại của bài viết
  const currentCatalogName = post.catalog;

  // Lấy bài theo từng danh mục, loại bỏ danh mục hiện tại
  const catalogWithPosts = await Promise.all(
    catalogs
      .filter((catalogItem) => catalogItem.name !== currentCatalogName) // loại bỏ danh mục bài đang xem
      .map(async (catalogItem) => {
        const posts = await getPostsByCatalog(catalogItem.name);
        return {
          catalog: catalogItem,
          posts,
        };
      })
  );

  if (!relatedPosts || !post) {
    return <ErrorLoading />;
  }

  const canonicalUrl = postUrl(post);

  // NewsArticle: định dạng Google ưu tiên cho Tin tức (Google News / Top Stories).
  const newsArticleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title.slice(0, 110), // Google giới hạn headline ~110 ký tự
    image: [post.imageUrl],
    datePublished: post.createdAt,
    dateModified: post.updatedAt || post.createdAt,
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/logo.png'),
      },
    },
    description: toMetaDescription(post.content),
    articleSection: post.catalog,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
  };

  // BreadcrumbList: giúp Google hiển thị đường dẫn phân cấp trong kết quả tìm kiếm.
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Tin tức', item: absoluteUrl('/tin-tuc-moi-nhat') },
      { '@type': 'ListItem', position: 3, name: post.title, item: canonicalUrl },
    ],
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <ClientPostDetailPage relatedPosts={filteredRelated} post={post} catalogWithPosts={catalogWithPosts} />
    </>
  );
}
