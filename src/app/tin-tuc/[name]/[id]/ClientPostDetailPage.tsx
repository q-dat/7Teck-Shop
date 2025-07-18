'use client';
import TimeAgo from '@/components/orther/timeAgo/TimeAgo';
import HeaderResponsive from '@/components/userPage/HeaderResponsive';
import { IPost } from '@/types/type/products/post/post';
import { scrollToTopSmoothly } from '@/utils/scrollToTopSmoothly';
import { slugify } from '@/utils/slugify';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { FaArrowLeftLong } from 'react-icons/fa6';

interface ClientPostDetailPageProps {
  posts: IPost[];
  post: IPost | null;
}
export default function ClientPostDetailPage({ posts, post }: ClientPostDetailPageProps) {
  const router = useRouter();
  const { id } = useParams<{ id: string; title: string }>();

  const [selectedPost, setSelectedPost] = useState<IPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    scrollToTopSmoothly();
    const fetchPost = async () => {
      setLoading(true);
      if (id && post) {
        setSelectedPost(post);
      } else {
        setSelectedPost(null);
      }
      setLoading(false);
    };

    fetchPost();
  }, [id, post]);

  // Các bài viết khác (loại bỏ bài hiện tại)
  const otherPosts: IPost[] = posts.filter((p) => p._id !== selectedPost?._id);

  // Điều hướng tới chi tiết bài viết khác
  const handlePostSelect = (post: IPost) => {
    const titleSlug = encodeURIComponent(slugify(post?.title));
    router.push(`/tin-tuc/${titleSlug}/${post._id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      <HeaderResponsive Title_NavbarMobile="7teck.vn" />
      <div className="py-[60px] xl:pt-0">
        <div className="breadcrumbs mb-10 px-[10px] py-2 text-sm text-black shadow xl:px-desktop-padding">
          <ul className="font-light">
            <li>
              <Link aria-label="Trang chủ" href="/">
                Trang Chủ
              </Link>
            </li>
            <li>
              {selectedPost ? (
                <Link aria-label="Chi tiết" href="">
                  {selectedPost?.title}
                </Link>
              ) : (
                <Link aria-label="Chi tiết" href="">
                  Chi Tiết
                </Link>
              )}
            </li>
          </ul>
        </div>

        <div className="px-2">
          <div className="xl:px-desktop-padding">
            <Link aria-label="Trở về trang tin tức" href="/tin-tuc-moi-nhat" className="flex items-center justify-start text-primary">
              <FaArrowLeftLong />
              Trở về trang tin tức
            </Link>

            {loading ? (
              <>Đang tải...</>
            ) : (
              <div>
                {selectedPost ? (
                  <div className="mb-10">
                    <p className="text-[35px] font-bold">{selectedPost?.title}</p>
                    <p className="text-[14px] text-blue-500">{new Date(selectedPost?.updatedAt).toLocaleDateString('vi-VN')}</p>
                    <p className="text-[14px] font-light">Danh mục:&nbsp;{selectedPost?.catalog}</p>
                    <hr className="my-4" />
                    <div
                      dangerouslySetInnerHTML={{
                        __html: selectedPost?.content,
                      }}
                      className="text-[18px] text-black"
                    ></div>
                  </div>
                ) : (
                  <p aria-label="Bài viết này không tồn tại" className="my-3 rounded-md bg-white p-2 text-center text-2xl font-light text-primary">
                    Bài viết này không tồn tại!
                    <br />
                    <span
                      aria-label=" Xin lỗi vì sự bất tiện này. Quý độc giả vui lòng theo dõi
                    các bài viết khác trên trang."
                      className="text-xl"
                    >
                      Xin lỗi vì sự bất tiện này. Quý độc giả vui lòng theo dõi các bài viết khác trên trang.
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="px-0 xl:px-desktop-padding">
            <div role="region" aria-label="Bài viết nổi bật khác">
              <h1 className="p-1 font-semibold uppercase">Bài viết khác</h1>
              <p className="mx-1 mb-3 h-[2px] w-[110px] bg-primary"></p>
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              {otherPosts.slice(0, 6).map((post) => (
                <div
                  key={post?._id}
                  className="flex cursor-pointer flex-row items-start justify-start gap-2 rounded bg-white p-1"
                  onClick={() => handlePostSelect(post)}
                >
                  <div className="min-h-[100px] w-2/3 overflow-hidden">
                    <Image
                      height={300}
                      width={300}
                      loading="lazy"
                      src={post?.imageUrl}
                      alt="Ảnh đại diện"
                      className="left-0 top-0 z-10 h-auto w-full rounded-sm object-contain"
                    />
                  </div>
                  <div className="flex w-full flex-col items-start justify-start">
                    <p className="line-clamp-5 w-full py-1 text-sm text-black">{post?.title}</p>
                    <p className="pt-2 text-[12px] text-primary">
                      {new Date(post?.updatedAt).toLocaleDateString('vi-VN')}
                      &nbsp;(
                      <TimeAgo date={post?.updatedAt} />)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
