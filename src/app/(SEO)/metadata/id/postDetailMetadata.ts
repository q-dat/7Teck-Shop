import { Metadata } from 'next';
import { IPost } from '@/types/type/products/post/post';
import { SITE_NAME, postUrl, toMetaDescription } from '@/app/(SEO)/lib/seo';

export function buildPostDetailMetadata(post: IPost): Metadata {
  const url = postUrl(post);
  const description = toMetaDescription(post.content);
  const title = `${post.title} | ${SITE_NAME}`;

  return {
    title,
    description,
    openGraph: {
      title: post.title,
      description,
      url,
      siteName: SITE_NAME,
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
      description,
      images: [post.imageUrl],
    },
    robots: 'index, follow',
    alternates: {
      canonical: url,
    },
  };
}
