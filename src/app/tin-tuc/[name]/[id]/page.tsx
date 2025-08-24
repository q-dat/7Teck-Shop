import { PageProps } from '@/types/type/pages/page-props';
import { getAllPosts, getPostById } from '@/services/postService';
import ClientPostDetailPage from './ClientPostDetailPage';
import ErrorLoading from '@/components/orther/error/ErrorLoading';
import { IPost } from '@/types/type/products/post/post';
import { buildPostDetailMetadata } from '@/metadata/id/postDetailMetadata';

export const revalidate = 60;

// Dùng generateMetadata để dynamic meta
export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const post: IPost | null = await getPostById(id);

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

  const posts: IPost[] = await getAllPosts();
  const post: IPost | null = await getPostById(id);

  if (!posts || !post) {
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
      <ClientPostDetailPage posts={posts} post={post} />
    </>
  );
}
