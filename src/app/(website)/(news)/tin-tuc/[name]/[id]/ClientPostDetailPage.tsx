'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import LoadingSpinner from '@/components/orther/loading/LoadingSpinner';
import CatalogSidebar from './CatalogSidebar';
import RelatedPosts from './RelatedPosts';
import PostDetailContent from './PostDetailContent';
import PostNotFound from './PostNotFound';
import TimeAgo from '@/components/orther/timeAgo/TimeAgo';
import { IPostCatalog } from '@/types/type/catalogs/post-catalog/post-catalog';
import { IPost } from '@/types/type/products/post/post';
import { useNavigateToPostDetail } from '@/hooks/useNavigateToPostDetail';
import { scrollToTopInstantly } from '@/utils/scrollToTop';
import HeaderResponsive from '@/components/userPage/ui/HeaderResponsive';

interface ClientPostDetailPageProps {
  post: IPost | null;
  relatedPosts?: IPost[];
  catalogWithPosts?: {
    catalog: IPostCatalog;
    posts: IPost[];
  }[];
}

export default function ClientPostDetailPage({ post, relatedPosts = [], catalogWithPosts }: ClientPostDetailPageProps) {
  const { id } = useParams<{ id: string }>();
  const { navigateToPostDetail } = useNavigateToPostDetail();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    scrollToTopInstantly();
    setMounted(true);
  }, [id]);

  if (!mounted) {
    return <LoadingSpinner />;
  }

  if (!post) {
    return <PostNotFound />;
  }

  return (
    <div>
      <HeaderResponsive Title_NavbarMobile="7teck.vn" />
      <div className="py-[60px] xl:pt-0">
        <div className="breadcrumbs px-[10px] py-2 text-sm text-black shadow xl:px-desktop-padding">
          <ul className="font-light">
            <li>
              <Link href="/">Trang Chủ</Link>
            </li>
            <li>
              <span className="text-sm font-normal">&nbsp;{post.catalog}</span>
            </li>
            <li>
              <span className="text-xs text-blue-500">
                {new Date(post.updatedAt).toLocaleDateString('vi-VN')}
                &nbsp;(
                <TimeAgo date={post.updatedAt} />)
              </span>
            </li>
          </ul>
        </div>

        <div className="px-2">
          <PostDetailContent post={post} catalogWithPosts={catalogWithPosts} onSelectPost={navigateToPostDetail} />
          <div className="xl:px-desktop-padding">
            <RelatedPosts relatedPosts={relatedPosts} />
          </div>
          <div className="block xl:hidden">
            <CatalogSidebar catalogWithPosts={catalogWithPosts} onSelectPost={navigateToPostDetail} />
          </div>
        </div>
      </div>
    </div>
  );
}
