export const revalidate = 60;

import { PageProps } from '@/types/type/pages/page-props';
import React from 'react';
import ClientPostDetailPage from './ClientPostDetailPage';
import { getAllPosts, getPostById } from '@/services/postService';
import { IPost } from '@/types/type/products/post/post';
import ErrorLoading from '@/components/orther/error/ErrorLoading';
import Head from 'next/head';

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
      <Head>
        {/* SEO cơ bản */}
        <title>{post.title}</title>
        <meta name="description" content={post.content.slice(0, 160)} />
        {/* Open Graph cho Facebook / Zalo */}
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.content.slice(0, 160)} />
        <meta property="og:image" content={post.imageUrl} />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_SITE_URL}/tin-tuc/${encodeURIComponent(post.title)}/${post._id}`} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="7Teck" />

        {/* Twitter Card (nếu share lên Twitter/X) */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.content.slice(0, 160)} />
        <meta name="twitter:image" content={post.imageUrl} />

        {/* JSON-LD schema.org cho Google */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </Head>

      <ClientPostDetailPage posts={posts} post={post} />
    </>
  );
}
