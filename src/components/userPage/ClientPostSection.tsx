'use client';
import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from 'react-daisyui';
import { IoIosArrowForward } from 'react-icons/io';
import { FaRegNewspaper } from 'react-icons/fa';
import { slugify } from '@/utils/slugify';
import { IPost } from '@/types/type/products/post/post';
import { images } from '../../../public/images';

interface ClientPostSectionProps {
  news: IPost[];
  tricks: IPost[];
}

/**
 * PostCard Component: Tối ưu hóa hiển thị bài viết
 * Sử dụng aspect-ratio 16:9 chuẩn Cinematic cho ảnh bìa
 */
const PostCard = ({ post, index }: { post: IPost; index: number }) => {
  const postUrl = `/tin-tuc/${encodeURIComponent(slugify(post?.title))}/${post._id}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group flex flex-col bg-white/80 backdrop-blur-sm xl:bg-white"
    >
      <Link href={postUrl} className="flex h-full flex-col">
        {/* MEDIA SECTION */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-100">
          <Image
            fill
            src={post?.imageUrl}
            alt={post?.title}
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-neutral-900/0 transition-colors duration-300 group-hover:bg-neutral-900/10" />
        </div>

        {/* CONTENT SECTION */}
        <div className="flex flex-1 flex-col p-2">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Technology</span>
            <span className="h-px w-4 bg-neutral-200" />
            <span className="text-[10px] text-neutral-400">{new Date(post?.updatedAt).toLocaleDateString('vi-VN')}</span>
          </div>

          <h3 className="line-clamp-2 text-sm font-medium leading-relaxed text-neutral-900 transition-colors group-hover:text-primary xl:text-lg">
            {post?.title}
          </h3>

          <div className="mt-auto flex translate-x-[-10px] items-center gap-2 pt-4 text-[10px] font-bold uppercase tracking-widest text-neutral-900 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
            Đọc bài viết <IoIosArrowForward className="text-xs" />
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

export default function ClientPostSection({ news, tricks }: ClientPostSectionProps) {
  const urlNews = '/tin-tuc-moi-nhat';
  const urlTipsAndTricksPage = '/thu-thuat-va-meo-hay';

  // Memoize data để tránh re-render thừa
  const displayedNews = useMemo(() => news.slice(0, 4), [news]);
  const displayedTricks = useMemo(() => tricks.slice(0, 4), [tricks]);

  return (
    <div className="relative min-h-screen">
      {/* BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0 bg-cover bg-fixed bg-center bg-no-repeat" style={{ backgroundImage: `url(${images.bgBlog})` }}>
        <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 py-10">
        {/* MAIN HEADER */}
        <header className="mb-5 flex flex-col items-center px-2 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-white/30 text-white backdrop-blur-md"
          >
            <FaRegNewspaper size={24} />
          </motion.div>
          <h2 className="text-4xl font-light tracking-tighter text-white xl:text-6xl">Insight & Update</h2>
          <p className="mt-4 max-w-xl text-sm font-light leading-relaxed text-neutral-300 xl:text-base">
            Cập nhật những xu hướng công nghệ mới nhất và những thủ thuật hữu ích giúp bạn làm chủ thiết bị của mình.
          </p>
        </header>

        <div className="w-full space-y-10 px-2 xl:px-desktop-padding">
          {/* SECTION: BẢN TIN */}
          {displayedNews.length > 0 && (
            <section>
              <div className="mb-10 flex items-end justify-between border-b border-white/20 pb-6">
                <div className="space-y-1">
                  <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white/60">Tin tức</h3>
                  <p className="text-2xl font-light text-white">Bản tin công nghệ mới</p>
                </div>
                <Link href={urlNews}>
                  <Button
                    size="sm"
                    className="group rounded-none border-white/30 bg-transparent text-xs font-bold uppercase tracking-widest text-white hover:bg-white hover:text-neutral-900"
                  >
                    Tất cả <IoIosArrowForward className="transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-2 xl:grid-cols-6">
                {displayedNews.map((post, idx) => (
                  <PostCard key={post._id} post={post} index={idx} />
                ))}
              </div>
            </section>
          )}

          {/* SECTION: THỦ THUẬT */}
          {displayedTricks.length > 0 && (
            <section>
              <div className="mb-10 flex items-end justify-between border-b border-white/20 pb-6">
                <div className="space-y-1">
                  <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white/60">Knowledge</h3>
                  <p className="text-2xl font-light text-white">Thủ thuật & Mẹo hay</p>
                </div>
                <Link href={urlTipsAndTricksPage}>
                  <Button
                    size="sm"
                    className="group rounded-none border-white/30 bg-transparent text-xs font-bold uppercase tracking-widest text-white hover:bg-white hover:text-neutral-900"
                  >
                    Khám phá <IoIosArrowForward className="transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-2 xl:grid-cols-6">
                {displayedTricks.map((post, idx) => (
                  <PostCard key={post._id} post={post} index={idx} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
