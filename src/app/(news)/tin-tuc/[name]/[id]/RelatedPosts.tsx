'use client';
import { useNavigateToPostDetail } from '@/hooks/useNavigateToPostDetail';
import { IPost } from '@/types/type/products/post/post';
import Image from 'next/image';

interface RelatedPostsProps {
  relatedPosts: IPost[];
}

export default function RelatedPosts({ relatedPosts }: RelatedPostsProps) {
  // Handle Click Post To Post Detail
  const { navigateToPostDetail } = useNavigateToPostDetail();

  if (relatedPosts.length === 0) return null;
  return (
    <section className="w-full">
      {/* Title */}
      <div role="region" aria-label="Bài viết liên quan">
        <h2 className="p-1 text-2xl font-bold uppercase">Tin liên quan</h2>
        <div className="mx-1 mb-3 h-[2px] w-[110px] bg-primary" />
      </div>

      {/* List */}
      <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-4">
        {relatedPosts.map((post) => (
          <article
            key={post._id}
            className="flex cursor-pointer gap-2 overflow-hidden rounded bg-white p-2 transition hover:bg-primary-lighter"
            onClick={() => navigateToPostDetail(post)}
          >
            {/* Image */}
            <div className="aspect-square w-[90px] shrink-0 overflow-hidden rounded-sm">
              <Image src={post.imageUrl || ''} alt={post.title} width={300} height={300} loading="lazy" className="h-full w-full object-cover" />
            </div>

            {/* Content */}
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="line-clamp-2 text-sm font-semibold text-default">{post.title}</p>

              <div
                className="line-clamp-2 text-xs font-light text-default [&_*]:m-0 [&_*]:leading-snug"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
