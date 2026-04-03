import { Metadata } from 'next';
import { IPost } from '@/types/type/products/post/post';

export function buildPostDetailMetadata(post: IPost): Metadata {
  return {
    title: post.title,
    description: post.content.slice(0, 160),
    openGraph: {
      title: post.title,
      description: post.content.slice(0, 160),
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/tin-tuc/${encodeURIComponent(post.title)}/${post._id}`,
      siteName: '7teck.vn',
      images: [
        {
          url: post.imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      type: 'article',
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.content.slice(0, 160),
      images: [post.imageUrl],
    },
    robots: 'index, follow',
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/tin-tuc/${encodeURIComponent(post.title)}/${post._id}`,
    },
  };
}
