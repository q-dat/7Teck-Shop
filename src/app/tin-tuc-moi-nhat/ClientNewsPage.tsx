'use client';
import React, { useEffect, useState } from 'react';
import HeaderResponsive from '@/components/userPage/ui/HeaderResponsive';
import TimeAgo from '@/components/orther/timeAgo/TimeAgo';
import { slugify } from '@/utils/slugify';
import { scrollToTopInstantly } from '@/utils/scrollToTop';
import { IPost } from '@/types/type/products/post/post';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import LoadingSpinner from '@/components/orther/loading/LoadingSpinner';
import { CiSearch } from 'react-icons/ci';

export default function ClientNewsPage({ news }: { news: IPost[] }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    scrollToTopInstantly();
    setLoading(false);
  }, [news]);

  // Handle Click Post To Post Detail
  const router = useRouter();
  const handlePostClick = (post: (typeof news)[0]) => {
    const titleSlug = encodeURIComponent(slugify(post?.title));
    router.push(`/tin-tuc/${titleSlug}/${post?._id}`);
  };

  const featuredPost = news[0];
  const secondaryPosts = news.slice(1, 5);
  const remainingPosts = news.slice(5);

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
          <LoadingSpinner />
        ) : news.length === 0 ? (
          <div className="col-span-full flex w-full items-center justify-center p-2">
            <div className="max-w-xl rounded-xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center shadow-md">
              <div className="mb-5 flex justify-center">
                <CiSearch className="text-6xl" />
              </div>
              {/* Tiêu đề */}
              <h2 className="mb-3 text-lg font-semibold text-gray-800 md:text-xl">
                Hiện tại chưa có bài viết trong mục <br />
                <span className="text-primary">Thủ Thuật & Mẹo Hay</span>
              </h2>

              {/* Nội dung */}
              <p className="mb-6 text-sm text-gray-600 md:text-base">
                Chúng tôi đang cập nhật những nội dung hữu ích nhất cho bạn.
                <br />
                Trong lúc chờ, bạn có thể khám phá thêm các <strong className="text-primary">thủ thuật & mẹo hay công nghệ</strong> tại trang dưới
                đây:
              </p>

              {/* Nút CTA */}
              <div className="flex flex-row items-center justify-center gap-3">
                <Link
                  href="/tin-tuc-moi-nhat"
                  className="inline-block rounded-lg bg-primary p-2 text-xs font-bold uppercase text-white transition-all hover:bg-primary/80 xl:px-5 xl:py-3 xl:text-sm"
                >
                  Xem Thủ Thuật & Mẹo Hay
                </Link>
                <Link
                  href="/"
                  className="inline-block rounded-lg border border-primary p-2 text-xs font-bold uppercase text-primary transition-all hover:bg-primary hover:text-white xl:px-5 xl:py-3 xl:text-sm"
                >
                  Về Trang Chủ
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-8 px-2 xl:px-desktop-padding">
            {/* Featured Section */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              {/* Featured big */}
              <div className="group relative cursor-pointer overflow-hidden rounded lg:col-span-2" onClick={() => handlePostClick(featuredPost)}>
                <Image
                  src={featuredPost?.imageUrl}
                  alt={featuredPost?.title}
                  width={800}
                  height={500}
                  className="h-[300px] w-full object-cover transition-transform duration-500 group-hover:scale-105 lg:h-[400px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <span className="rounded bg-primary px-2 py-1 text-xs">{featuredPost?.catalog}</span>
                  <h2 className="mt-2 text-2xl font-bold">{featuredPost?.title}</h2>
                  <p className="mt-1 text-sm">{new Date(featuredPost?.updatedAt).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>

              {/* Side list */}
              <div className="space-y-4">
                {secondaryPosts.map((post) => (
                  <div key={post?._id} className="group flex cursor-pointer gap-3" onClick={() => handlePostClick(post)}>
                    <Image
                      src={post?.imageUrl}
                      alt={post?.title}
                      width={120}
                      height={80}
                      className="h-[80px] w-[120px] flex-shrink-0 rounded object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div>
                      <h3 className="line-clamp-2 text-sm font-semibold group-hover:text-primary">{post?.title}</h3>
                      <p className="mt-1 text-xs text-primary">
                        {new Date(post?.updatedAt).toLocaleDateString('vi-VN')} (<TimeAgo date={post?.updatedAt} />)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Remaining posts grid */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {remainingPosts.map((post) => (
                <div
                  key={post?._id}
                  className="group cursor-pointer overflow-hidden rounded bg-white shadow-sm"
                  onClick={() => handlePostClick(post)}
                >
                  <div className="overflow-hidden">
                    <Image
                      src={post?.imageUrl}
                      alt={post?.title}
                      width={300}
                      height={200}
                      className="h-[180px] w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-3">
                    <h4 className="line-clamp-2 text-sm font-semibold group-hover:text-primary">{post?.title}</h4>
                    <p className="mt-2 text-xs text-primary">
                      {new Date(post?.updatedAt).toLocaleDateString('vi-VN')} (<TimeAgo date={post?.updatedAt} />)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
