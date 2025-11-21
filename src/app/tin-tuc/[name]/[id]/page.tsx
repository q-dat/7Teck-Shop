export const revalidate = 18000;

import { PageProps } from '@/types/type/pages/page-props';
import { getAllCatalogs, getPostsByCatalog, getPostWithFallback } from '@/services/postService';
import ClientPostDetailPage from './ClientPostDetailPage';
import ErrorLoading from '@/components/orther/error/ErrorLoading';
import { IPost } from '@/types/type/products/post/post';
import { buildPostDetailMetadata } from '@/metadata/id/postDetailMetadata';

// Dùng generateMetadata để dynamic meta
export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const post: IPost | null = await getPostWithFallback(id);

  if (!post) {
    return {
      title: 'Bài viết không tồn tại - 7Teck',
      description: 'Bài viết bạn tìm không còn hoặc đã bị xóa.',
    };
  }

  return buildPostDetailMetadata(post);
}

export default async function PostDetail({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    image: [post.imageUrl],
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Organization',
      name: '7Teck',
    },
    publisher: {
      '@type': 'Organization',
      name: '7Teck',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
      },
    },
    description: post.content.slice(0, 160),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${process.env.NEXT_PUBLIC_SITE_URL}/tin-tuc/${encodeURIComponent(post.title)}/${post._id}`,
    },
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ClientPostDetailPage relatedPosts={filteredRelated} post={post} catalogWithPosts={catalogWithPosts} />
    </>
  );
}
