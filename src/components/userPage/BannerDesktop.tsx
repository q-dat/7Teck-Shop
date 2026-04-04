import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { RiScrollToBottomLine } from 'react-icons/ri';
import Link from 'next/link';
import { IoShieldCheckmarkOutline } from 'react-icons/io5';
import { FaCartPlus, FaRegEye } from 'react-icons/fa';
import { formatCurrency } from '@/utils/formatCurrency';
import { MdArrowBackIosNew, MdArrowForwardIos, MdNavigateNext } from 'react-icons/md';
import { images } from '../../../public/images';
import { useImageErrorHandler } from '@/hooks/useImageErrorHandler';
import { useScroll } from '@/hooks/useScroll';
import imageRepresent from '../../../public/image-represent';
import ProductPlaceholders from './ProductPlaceholders';
import { IPhone } from '@/types/type/products/phone/phone';

interface Props {
  mostViewedPhones: IPhone[];
  loading: boolean;
}
//
const BANNER_SLIDES = [images.MacProM4, images.Ip17PM || images.MacProM4, images.OppoReno14 || images.MacProM4];

export default function BannerDesktop({ mostViewedPhones, loading }: Props) {
  const { scrollRef, isLeftVisible, isRightVisible, hasOverflow, scrollBy } = useScroll();
  const fallbackSrc = imageRepresent.Fallback;
  const { handleImageError, isImageErrored } = useImageErrorHandler();

  // Logic Auto-play Slider
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNER_SLIDES.length);
    }, 5000); // Đổi slide sau mỗi 5 giây
    return () => clearInterval(slideInterval);
  }, []);

  const handleAddToCart = (phone: IPhone) => {
    const productToBuy = {
      _id: phone?._id,
      name: phone?.name,
      slug: phone?.slug,
      img: phone?.img,
      price: phone?.price,
      ram: phone?.phone_catalog_id?.configuration_and_memory?.ram,
      color: phone?.color,
      link: `/${phone?.slug}`,
    };
    localStorage.setItem('selectedProduct', JSON.stringify(productToBuy));
    window.location.href = '/thanh-toan';
  };

  return (
    <header className="relative h-[85vh] w-full overflow-hidden bg-slate-900">
      {/* Background Slider */}
      <div className="pointer-events-none absolute inset-0">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <Image
              src={BANNER_SLIDES[currentSlide]}
              alt={`Hero background slide ${currentSlide + 1}`}
              fill
              sizes="100vw"
              className="scale-105 transform-gpu object-cover object-center will-change-transform"
              priority={currentSlide === 0}
            />
          </motion.div>
        </AnimatePresence>

        {/* Lớp phủ mỏng hơn để màu sắc và chi tiết nền nổi bật */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/30 to-transparent" />
      </div>

      {/* Content */}
      <motion.div initial={{ opacity: 1, y: 0 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0 }}>
        <div className="relative mt-20 flex h-full w-full flex-row items-start justify-start gap-8 px-desktop-padding">
          {/* Text Content */}
          <div className="flex w-1/2 flex-col items-start gap-5 pt-10">
            <div className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-1 text-xs font-medium ring-1 ring-white/20 backdrop-blur-md">
              <span className="flex-shrink-0 rounded-sm bg-primary px-2 py-0.5 text-[10px] font-bold tracking-wide text-white shadow-sm">
                www.7Teck.vn
              </span>
              <span className="font-semibold uppercase text-cyan-50">Ưu Đãi Đặc Quyền</span>
            </div>

            <h1 className="text-4xl font-extrabold leading-tight text-white drop-shadow-lg 2xl:text-5xl">
              <span className="inline-flex items-center justify-center gap-3 text-cyan-400">
                Thu Cũ Đổi Mới
                <IoShieldCheckmarkOutline className="text-emerald-400" />
              </span>
              <br />
              Nhận Ngay Giá Tốt Nhất!
            </h1>

            <p className="text-base leading-relaxed text-slate-100 drop-shadow-md">
              Đổi điện thoại cũ lấy siêu phẩm mới với mức giá hấp dẫn.
              <br />
              Giải pháp thông minh để nâng cấp thiết bị ngay hôm nay.
              <br />
              Lên đến <i className="text-xl font-extrabold text-yellow-400">90%</i> giá trị sản phẩm - minh bạch, nhanh chóng.
            </p>

            <div className="mt-2 flex flex-wrap gap-4 uppercase">
              <Link
                href="/bang-gia-thu-mua"
                className="inline-flex items-center justify-center rounded-md bg-white px-5 py-2.5 text-sm font-bold text-slate-900 shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all focus:outline-none hover:-translate-y-0.5 hover:bg-slate-100"
              >
                Điều Kiện Áp Dụng
              </Link>

              <Link
                href="/dien-thoai"
                className="inline-flex items-center justify-center rounded-md border border-white/30 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-white/50 hover:bg-white/20"
              >
                Điện Thoại New Seal
              </Link>
            </div>

            <div className="w-full pt-2">
              <span className="text-sm text-slate-300">
                Được tin dùng bởi hàng ngàn khách hàng. Xem hành trình{' '}
                <Link className="font-medium text-cyan-400 hover:underline" href="/hanh-trinh-khach-hang">
                  tại đây.
                </Link>
              </span>
            </div>
          </div>

          {/* Outstanding product */}
          <div className="relative w-1/2 pt-10">
            {/* Header Section */}
            <div className="flex flex-row items-center justify-between pb-4">
              <div className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-1 text-xs font-medium ring-1 ring-white/20 backdrop-blur-md">
                <span className="flex-shrink-0 rounded-sm bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white">Điện thoại</span>
                <span className="font-bold uppercase text-yellow-400">Sản Phẩm Nổi Bật</span>
              </div>
              <Link
                href="/dien-thoai"
                className="group inline-flex items-center justify-center rounded-md bg-white/10 px-3 py-1 font-medium ring-1 ring-white/20 backdrop-blur-md transition-colors hover:bg-white/20"
              >
                <span className="text-xs text-white">Xem Thêm</span>
                <MdNavigateNext className="text-lg text-white transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Product List */}
            <section
              ref={scrollRef}
              className="flex w-full snap-x snap-mandatory flex-row gap-4 overflow-x-auto scroll-smooth pb-6 pt-2 scrollbar-hide"
            >
              {loading ? (
                <ProductPlaceholders count={12} />
              ) : (
                mostViewedPhones.map((phone) => {
                  const phoneUrl = phone?.slug;
                  const isErrored = isImageErrored(phone?._id);
                  const src = isErrored || !phone?.img ? fallbackSrc : phone?.img;

                  return (
                    <div
                      key={phone?._id}
                      className="group relative flex w-[240px] shrink-0 snap-start flex-col justify-between rounded-md border border-white/20 bg-slate-800/60 shadow-lg backdrop-blur-lg transition-all duration-300 hover:-translate-y-1.5 hover:border-primary-lighter hover:bg-slate-800/80 hover:shadow-[0_10px_20px_rgba(0,180,216,0.2)]"
                    >
                      {/* Status Badge */}
                      {phone?.status && (
                        <div className="absolute left-2 top-2 z-10 rounded-sm bg-gradient-to-r from-emerald-500 to-green-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                          {phone.status}
                        </div>
                      )}

                      {/* Product Image */}
                      <Link
                        aria-label="Xem chi tiết sản phẩm"
                        href={`/${phoneUrl}`}
                        className="relative h-[200px] w-full overflow-hidden rounded-t-md p-2"
                      >
                        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
                        <Image
                          height={200}
                          width={240}
                          alt={phone?.name || 'Điện thoại'}
                          loading="lazy"
                          className="relative z-0 h-full w-full object-contain drop-shadow-xl transition-transform duration-500 ease-out group-hover:scale-105"
                          src={src}
                          onError={() => handleImageError(phone?._id)}
                        />
                      </Link>

                      {/* Product Info */}
                      <div className="flex flex-col gap-2 p-3 pt-1">
                        {/* View Count & Name */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-cyan-300">
                            <FaRegEye />
                            <span>{phone?.view || 0} lượt xem</span>
                          </div>
                          <Link aria-label="Chi tiết" href={`/${phoneUrl}`}>
                            <h3 className="line-clamp-2 min-h-[36px] text-sm font-bold leading-snug text-white transition-colors group-hover:text-cyan-200">
                              {phone?.name}
                            </h3>
                          </Link>
                        </div>

                        {/* Price & Buy Action */}
                        <div className="mt-1 flex items-end justify-between border-t border-white/10 pt-2">
                          <div className="flex flex-col">
                            {phone?.sale !== 0 && <del className="text-xs font-medium text-slate-400">{formatCurrency(phone?.sale)}</del>}
                            <span className="text-[17px] font-extrabold text-yellow-400 drop-shadow-sm">{formatCurrency(phone?.price)}</span>
                          </div>

                          <button
                            onClick={() => handleAddToCart(phone)}
                            className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary text-white shadow-md transition-all duration-300 hover:scale-110 hover:bg-primary-lighter hover:text-primary hover:shadow-[0_0_10px_rgba(0,180,216,0.6)]"
                            aria-label="Thêm vào giỏ hàng"
                          >
                            <FaCartPlus className="text-sm" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </section>

            {/* Navigation Button */}
            {!loading && mostViewedPhones.length > 0 && (hasOverflow || mostViewedPhones.length > 12) && (
              <div className="pointer-events-none absolute inset-y-0 -left-3 -right-3 flex items-center justify-between">
                <button
                  aria-label="Cuộn sang trái"
                  onClick={() => scrollBy(-450)}
                  className={`pointer-events-auto z-10 flex h-8 w-8 items-center justify-center rounded-sm border border-white/20 bg-slate-900/80 text-white shadow-lg backdrop-blur-md transition-all duration-200 hover:scale-110 hover:border-cyan-400 hover:bg-slate-800 ${
                    isLeftVisible ? 'opacity-100' : 'pointer-events-none opacity-0'
                  }`}
                >
                  <MdArrowBackIosNew className="text-sm" />
                </button>
                <button
                  aria-label="Cuộn sang phải"
                  onClick={() => scrollBy(450)}
                  className={`pointer-events-auto z-10 flex h-8 w-8 items-center justify-center rounded-sm border border-white/20 bg-slate-900/80 text-white shadow-lg backdrop-blur-md transition-all duration-200 hover:scale-110 hover:border-cyan-400 hover:bg-slate-800 ${
                    isRightVisible ? 'opacity-100' : 'pointer-events-none opacity-0'
                  }`}
                >
                  <MdArrowForwardIos className="text-sm" />
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex items-center justify-center rounded-md border border-white/10 bg-white/10 p-2 backdrop-blur-md"
        >
          <RiScrollToBottomLine size={20} className="text-cyan-200 opacity-90 transition-transform duration-300 hover:scale-110" />
        </motion.div>
      </div>
    </header>
  );
}
