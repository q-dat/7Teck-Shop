'use client';
import { useRouter } from 'next/navigation';
import { NEWS_BASE_PATH } from '@/app/tin-tuc';
import { IPost } from '@/types/type/products/post/post';
import { slugify } from '@/utils/slugify';

interface NavigateOptions {
  scroll?: boolean;
}

export function useNavigateToPostDetail() {
  const router = useRouter();

  const navigateToPostDetail = (post: IPost, options?: NavigateOptions): void => {
    const titleSlug = encodeURIComponent(slugify(post.title));
    router.push(`${NEWS_BASE_PATH}/${titleSlug}/${post._id}`);

    if (options?.scroll !== false) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return { navigateToPostDetail };
}
