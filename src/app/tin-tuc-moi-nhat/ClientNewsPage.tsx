'use client';
import React, { useEffect, useState } from 'react';
import HeaderResponsive from '@/components/userPage/HeaderResponsive';
import TimeAgo from '@/components/orther/timeAgo/TimeAgo';
import { slugify } from '@/utils/slugify';
import { scrollToTopInstantly } from '@/utils/scrollToTop';
import { IPost } from '@/types/type/products/post/post';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function ClientNewsPage({ posts }: { posts: IPost[] }) {
  const [loading, setLoading] = useState(true);

  const news = posts?.filter((post) => post?.catalog.toLowerCase().includes('tin'));

  useEffect(() => {
    scrollToTopInstantly();
    if (posts.length === 0) {
      const fetchData = async () => {
        setLoading(true);
      };

      fetchData();
    } else {
      setLoading(false);
    }
  }, [posts]);

  // Handle Click Post To Post Detail
  const router = useRouter();
  const handlePostClick = (post: (typeof posts)[0]) => {
    const titleSlug = encodeURIComponent(slugify(post?.title));
    router.push(`/tin-tuc/${titleSlug}/${post._id}`);
  };

  return (
    <div>
      <HeaderResponsive Title_NavbarMobile="7teck.vn" />
      <div className="py-[60px] xl:pt-0">
        <div className="breadcrumbs px-[10px] py-2 text-sm text-black shadow xl:px-desktop-padding">
          <ul className="font-light">
            <li>
              <Link aria-label="Trang chủ" href="/">
                Trang Chủ
              </Link>
            </li>
            <li>
              <Link aria-label="Tin công nghệ" href="">
                Tin Công Nghệ
              </Link>
            </li>
          </ul>
        </div>
        {loading ? (
          <>Đang tải...</>
        ) : (
          <div className="mt-5 px-2 xl:px-desktop-padding">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
              {news.map((post) => (
                <div
                  key={post?._id}
                  className="relative cursor-pointer rounded border border-gray-50 bg-white p-2 shadow-inner hover:shadow-lg"
                  onClick={() => handlePostClick(post)}
                >
                  <p className="absolute left-1 top-1 z-10 rounded-sm bg-primary px-2 text-[12px] text-white">{post?.catalog}</p>
                  <div className="overflow-hidden">
                    <Image
                      height={300}
                      width={300}
                      loading="lazy"
                      src={post?.imageUrl}
                      alt="Ảnh đại diện"
                      className="h-auto w-full rounded-sm border transition-transform duration-1000 ease-in-out hover:scale-110"
                    />
                  </div>
                  <p className="line-clamp-3 py-1 text-base text-black">{post?.title}</p>
                  <hr />
                  <p className="pt-2 text-[12px] text-primary">
                    {new Date(post?.updatedAt).toLocaleDateString('vi-VN')}
                    &nbsp;(
                    <TimeAgo date={post?.updatedAt} />)
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
