'use client';

import { slugify } from '@/utils/slugify';
import Link from 'next/link';
import { Button } from 'react-daisyui';
import { IoIosArrowForward } from 'react-icons/io';
import { IPost } from '@/types/type/products/post/post';
import Image from 'next/image';
import { FaRegNewspaper } from 'react-icons/fa';
import { images } from '../../../public/images';

interface ClientPostSectionProps {
  news: IPost[];
  tricks: IPost[];
}

const urlNews = '/tin-tuc-moi-nhat';
const urlTipsAndTricksPage = '/thu-thuat-va-meo-hay';

export default function ClientPostSection({ news, tricks }: ClientPostSectionProps) {
  // Shared Card Component để đồng bộ style

  const PostCard = ({ post }: { post: IPost }) => (
    <article className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-md border border-gray-200 bg-white transition-all duration-300 hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <Link target="_blank" href={`/tin-tuc/${encodeURIComponent(slugify(post?.title))}/${post._id}`}>
        <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-gray-100">
          <Image
            fill
            loading="lazy"
            src={post?.imageUrl}
            alt={post?.title}
            className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
          />
          {/* Overlay rất nhẹ khi hover để tăng độ sâu */}
          <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/5"></div>
        </div>

        <div className="flex flex-1 flex-col justify-between p-2">
          <div>
            <h3 className="line-clamp-2 text-sm font-bold leading-snug text-gray-900 transition-colors group-hover:text-black xl:text-base xl:leading-normal">
              {post?.title}
            </h3>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
            <span>{new Date(post?.updatedAt).toLocaleDateString('vi-VN')}</span>
            <span className="font-medium text-black opacity-0 transition-opacity group-hover:opacity-100">Đọc ngay</span>
          </div>
        </div>
      </Link>
    </article>
  );

  return (
    <div
      style={{
        backgroundImage: `url(${images.bgBlog})`,
      }}
      className="relative bg-cover bg-fixed bg-center bg-no-repeat py-12"
    >
      {/* --- Main Section Header --- */}
      <div className="mb-5 flex flex-col items-center gap-3 px-2 text-center xl:px-desktop-padding">
        <div className="flex h-12 w-12 items-center justify-center rounded-md border border-white text-white">
          <FaRegNewspaper className="text-xl" />
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tight text-white xl:text-4xl">Tin Tức Công Nghệ</h2>
        <div className="h-1 w-16 rounded-sm bg-white"></div>
      </div>

      <div className="flex flex-col gap-12 px-2 xl:px-desktop-padding">
        {/* --- Section: Bản Tin --- */}
        {news.length > 0 && (
          <section role="region" aria-label="Bản tin mới nhất">
            <div className="mb-6 flex items-end justify-between border-b border-white pb-4">
              <h3 className="text-xl font-bold uppercase tracking-wider text-white">Bản Tin Mới</h3>
              <Link href={urlNews}>
                <Button
                  size="sm"
                  className="rounded-md border border-gray-300 bg-transparent text-white transition-all hover:border-black hover:bg-black hover:text-white"
                >
                  Xem Thêm <IoIosArrowForward />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
              {news.slice(0, 6).map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          </section>
        )}

        {/* --- Section: Thủ Thuật (Nếu muốn khác biệt, có thể dùng layout khác, ở đây dùng grid thống nhất) --- */}
        {tricks.length > 0 && (
          <section role="region" aria-label="Thủ thuật và mẹo hay">
            <div className="mb-6 flex items-end justify-between border-b border-white pb-4">
              <h3 className="text-xl font-bold uppercase tracking-wider text-white">Thủ Thuật & Mẹo</h3>
              <Link href={urlTipsAndTricksPage}>
                <Button
                  size="sm"
                  className="rounded-md border border-gray-300 bg-transparent text-black transition-all hover:border-black hover:bg-black hover:text-white"
                >
                  Xem Thêm <IoIosArrowForward />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
              {tricks.slice(0, 6).map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
