'use client';
import { slugify } from '@/utils/slugify';
import React from 'react';
import { images } from '../../public/images';
import Link from 'next/link';
import { Button } from 'react-daisyui';
import { IoIosArrowForward } from 'react-icons/io';
import TimeAgo from '@/components/orther/timeAgo/TimeAgo';
import { useRouter } from 'next/navigation';
import { IPost } from '@/types/type/products/post/post';
import Image from 'next/image';

interface ClientPostSectionProps {
  posts: IPost[];
}

const urlNews = '/tin-tuc-moi-nhat';
const urlTipsAndTricksPage = '/thu-thuat-va-meo-hay';

export default function ClientPostSection({ posts }: ClientPostSectionProps) {
  const news = posts?.filter((post) => post?.catalog.toLowerCase().includes('tin'));
  const tricks = posts?.filter((post) => post?.catalog.toLowerCase().includes('mẹo'));
  const router = useRouter();
  const handlePostClick = (post: (typeof news)[0]) => {
    const titleSlug = encodeURIComponent(slugify(post?.title));
    router.push(`/tin-tuc/${titleSlug}/${post._id}`);
  };

  return (
    <div
      style={{
        backgroundImage: `url(${images.bgBlog})`,
      }}
      className="relative mt-12 bg-cover bg-fixed bg-center bg-no-repeat py-12"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40"></div>
      <div className="relative z-10 px-2 xl:px-desktop-padding">
        {news.length > 0 && (
          <section role="region" aria-label="Bản tin mới nhất" className="mb-12">
            <div className="mb-6 flex flex-row items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight text-white">Tin Công Nghệ</h1>
              <Link href={urlNews}>
                <Button role="button" size="sm" className="flex items-center gap-1 bg-transparent text-white hover:bg-white/10">
                  Xem Thêm
                  <IoIosArrowForward className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
              {news.slice(0, 4).map((post) => (
                <article
                  key={post?._id}
                  className="group relative cursor-pointer overflow-hidden rounded-lg bg-white/90 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  onClick={() => handlePostClick(post)}
                >
                  <div className="relative aspect-[4/3] w-full">
                    <Image
                      fill
                      loading="lazy"
                      src={post?.imageUrl}
                      alt={post?.title}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5"></div>
                  </div>
                  <div className="p-4">
                    <h2 className="line-clamp-4 text-sm font-semibold text-gray-900 hover:text-blue-600">{post?.title}</h2>
                    <p className="mt-2 text-xs text-gray-500">
                      {new Date(post?.updatedAt).toLocaleDateString('vi-VN')} (
                      <TimeAgo date={post?.updatedAt} />)
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {tricks.length > 0 && (
          <section role="region" aria-label="Thủ thuật và mẹo hay">
            <div className="mb-6 flex flex-row items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight text-white">Thủ Thuật - Mẹo Hay</h1>
              <Link href={urlTipsAndTricksPage}>
                <Button role="button" size="sm" className="flex items-center gap-1 bg-transparent text-white hover:bg-white/10">
                  Xem Thêm
                  <IoIosArrowForward className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
              {tricks.slice(0, 4).map((post) => (
                <article
                  key={post?._id}
                  className="group relative cursor-pointer overflow-hidden rounded-lg bg-white/90 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  onClick={() => handlePostClick(post)}
                >
                  <div className="relative aspect-[4/3] w-full">
                    <Image
                      fill
                      loading="lazy"
                      src={post?.imageUrl}
                      alt={post?.title}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5"></div>
                  </div>
                  <div className="p-4">
                    <h2 className="line-clamp-3 text-sm font-semibold text-gray-900 hover:text-blue-600">{post?.title}</h2>
                    <p className="mt-2 text-xs text-gray-500">
                      {new Date(post?.updatedAt).toLocaleDateString('vi-VN')} (
                      <TimeAgo date={post?.updatedAt} />)
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
