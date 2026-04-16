'use client';
import { LoadingLocal } from '@/components/orther/loading';
import HeaderResponsive from '@/components/userPage/ui/HeaderResponsive';
import Zoom from '@/lib/Zoom';
import { scrollBy, updateScrollButtons, handleScrollButtons, handleThumbnailClick } from '@/utils/DetailPage/scrollUtils';
import { formatCurrency } from '@/utils/formatCurrency';
import { scrollToTopInstantly } from '@/utils/scrollToTop';
import { contact, hotlineUrl } from '@/utils/socialLinks';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { IoIosArrowDropdownCircle, IoMdCheckmarkCircleOutline } from 'react-icons/io';
import { MdArrowBackIosNew, MdArrowForwardIos, MdMemory, MdOutlineInvertColors } from 'react-icons/md';
import imageRepresent from '../../../../public/image-represent';
import { useImageErrorHandler } from '@/hooks/useImageErrorHandler';
import { FaFacebookSquare } from 'react-icons/fa';
import { handleProductShare } from '@/helper/handleShare';
import { TfiRulerPencil } from 'react-icons/tfi';
import { motion, AnimatePresence } from 'framer-motion';
import AdvancedContactSection from '../AdvancedContactSection';

export interface ProductCatalogGroup {
  [field: string]: string | number | string[] | null;
}
interface Product {
  _id: string;
  name: string;
  img: string;
  price: number;
  sale: number;
  color?: string;
  ram?: string;
  status?: string;
  des?: string;
  thumbnail?: string[];
  slug: string;
  catalog: Record<string, ProductCatalogGroup>;
  catalogContent: string;
}

interface FieldMap {
  group: string;
  name: string;
  fields: { field: string; name: string }[];
}

interface ClientProductDetailPageProps {
  product: Product;
  fieldMap: FieldMap[];
  namePrefix: string;
  relatedProducts?: Product[];
}
const EXCLUDED_STATUSES = ['Ngừng kinh doanh', 'Hết hàng', 'Ngưng bán'];

export default function ClientProductDetailPage({ product, fieldMap, namePrefix, relatedProducts }: ClientProductDetailPageProps) {
  const [selectedImage, setSelectedImage] = useState<string | null | undefined>(null);
  const isExcluded = product?.status && EXCLUDED_STATUSES.includes(product.status);

  const [activeTab, setActiveTab] = useState<string>('specs');
  const [isLeftButtonVisible, setIsLeftButtonVisible] = useState(true);
  const [isRightButtonVisible, setIsRightButtonVisible] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null!);
  const [loading, setLoading] = useState(true);
  const thumbnails = [product?.img, ...(product?.thumbnail || [])];

  const fallbackSrc = imageRepresent.Fallback;
  const { handleImageError, isImageErrored } = useImageErrorHandler();
  const isErrored = isImageErrored(product._id);
  const src = isErrored || !product.img ? fallbackSrc : product?.img;

  useLayoutEffect(() => {
    if (product && product?.catalog) {
      setLoading(false);
    }
    const timeout = setTimeout(() => {
      updateScrollButtons(scrollRef, setIsLeftButtonVisible, setIsRightButtonVisible);
    }, 100);
    return () => clearTimeout(timeout);
  }, [product, product?.thumbnail]);

  useEffect(() => {
    scrollToTopInstantly();
    const cleanup = handleScrollButtons(scrollRef, Object.keys(product?.catalog || {}).length, () =>
      updateScrollButtons(scrollRef, setIsLeftButtonVisible, setIsRightButtonVisible)
    );
    return cleanup;
  }, [product]);

  if (loading || !product || !product?.catalog) {
    return <LoadingLocal />;
  }

  const handleScrollTo = (targetId: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (!target) return;
    const offset = window.innerWidth >= 1280 ? 120 : 70;
    const y = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      <HeaderResponsive Title_NavbarMobile="7teck.vn" />
      <div className="pb-16 pt-[60px] xl:pt-0">
        {/* Breadcrumbs High-Contrast */}
        <div className="border-b border-black/5 bg-white px-3 py-2.5 xl:px-desktop-padding">
          <ul className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-black/40">
            <li>
              <Link className="transition-colors hover:text-primary" href="/">
                Trang Chủ
              </Link>
            </li>
            <li>/</li>
            <li className="line-clamp-1 text-black/80">
              {namePrefix} {product.name}
            </li>
          </ul>
        </div>

        <div className="mt-6 px-3 xl:px-desktop-padding">
          {/* Action Links Desktop */}
          <div className="mb-6 hidden items-center justify-between xl:flex">
            <h1 className="text-2xl font-bold tracking-tight text-black/90">
              {namePrefix} {product?.name}
            </h1>
            <div className="flex gap-4">
              {[
                { id: 'cam-ket', label: 'Cam Kết', icon: <IoMdCheckmarkCircleOutline size={16} /> },
                { id: 'thong-so', label: 'Thông Số', icon: <TfiRulerPencil size={16} /> },
              ].map((link) => (
                <Link
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={handleScrollTo(link.id)}
                  className="flex items-center gap-1.5 rounded-[4px] bg-primary/5 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-primary transition-all hover:bg-primary hover:text-white"
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
            {/* Cột Trái: Hình Ảnh (7 Cột) */}
            <div className="flex flex-col gap-4 lg:col-span-7">
              {/* Mobile Title */}
              <div className="block lg:hidden">
                <h1 className="text-xl font-bold leading-snug tracking-tight text-black/90">
                  {namePrefix} {product?.name}
                </h1>
                {product?.status && (
                  <span className="mt-2 inline-block rounded-[3px] bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                    {product?.status}
                  </span>
                )}
              </div>

              {/* Box Image Chính */}
              <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-md border border-black/10 bg-white sm:aspect-[4/3] xl:aspect-[16/11]">
                <Zoom>
                  <Image
                    priority
                    width={800}
                    height={800}
                    src={selectedImage || src}
                    alt={product?.name || 'Hình ảnh'}
                    className="max-h-full max-w-full object-contain p-4 mix-blend-multiply"
                    onError={() => handleImageError(product._id)}
                  />
                </Zoom>
                {isExcluded && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 backdrop-blur-[2px]">
                    <Image
                      src={imageRepresent.soldOut}
                      alt="Hết Hàng"
                      height={160}
                      width={160}
                      loading="lazy"
                      className="h-[120px] w-[120px] object-contain drop-shadow-md sm:h-[160px] sm:w-[160px]"
                    />
                  </div>
                )}
              </div>

              {/* Thumbnails Bento */}
              <div className="relative">
                <div ref={scrollRef} className="flex w-full gap-2 overflow-x-auto scroll-smooth py-1 scrollbar-hide">
                  {thumbnails.length > 0 ? (
                    thumbnails.map((thumb: string, index: number) => (
                      <motion.div
                        whileHover={{ y: -2 }}
                        key={index}
                        onClick={() => handleThumbnailClick(scrollRef, thumb, index, setSelectedImage)}
                        className={`relative flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-[4px] border bg-white transition-all xl:h-20 xl:w-20 ${
                          selectedImage === thumb || (!selectedImage && index === 0)
                            ? 'border-primary shadow-sm'
                            : 'border-black/10 hover:border-primary/40'
                        }`}
                      >
                        <Image
                          width={80}
                          height={80}
                          loading="lazy"
                          src={thumb}
                          alt="Thumbnail"
                          className="max-h-full max-w-full object-contain p-1"
                          onLoad={() => updateScrollButtons(scrollRef, setIsLeftButtonVisible, setIsRightButtonVisible)}
                        />
                      </motion.div>
                    ))
                  ) : (
                    <span className="text-sm text-black/40">Không có ảnh thu nhỏ</span>
                  )}
                </div>

                {/* Scroll Nav Buttons */}
                <AnimatePresence>
                  {isLeftButtonVisible && (
                    <motion.button
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      onClick={() => scrollBy(scrollRef, -100)}
                      className="absolute -left-3 top-1/2 -translate-y-1/2 rounded-full border border-black/10 bg-white p-1.5 text-black/60 shadow-sm transition-colors hover:text-primary"
                    >
                      <MdArrowBackIosNew size={14} />
                    </motion.button>
                  )}
                  {isRightButtonVisible && (
                    <motion.button
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      onClick={() => scrollBy(scrollRef, 100)}
                      className="absolute -right-3 top-1/2 -translate-y-1/2 rounded-full border border-black/10 bg-white p-1.5 text-black/60 shadow-sm transition-colors hover:text-primary"
                    >
                      <MdArrowForwardIos size={14} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Cột Phải: Thông tin & Mua hàng (5 Cột - Sticky) */}
            <div className="lg:col-span-5">
              <div className="flex flex-col gap-6 rounded-md border border-black/5 bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] lg:sticky lg:top-24 lg:p-6">
                {/* Price Box */}
                <div className="flex flex-col gap-1">
                  {product.price === 0 ? (
                    <Link href="/lien-he" className="text-3xl font-black tracking-tight text-price hover:underline">
                      Liên hệ báo giá
                    </Link>
                  ) : (
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-black tracking-tight text-price xl:text-4xl">{formatCurrency(product?.price)}</span>
                      {product?.sale !== 0 && <del className="text-sm font-semibold text-black/30 xl:text-base">{formatCurrency(product?.sale)}</del>}
                    </div>
                  )}
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-green-600">Sản phẩm có sẵn - Miễn phí vận chuyển HCM</span>
                </div>

                {/* Specs inline chips */}
                <div className="flex flex-col gap-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-black/40">Phiên bản đang chọn</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: 'color', label: product?.color, icon: <MdOutlineInvertColors size={14} /> },
                      { key: 'ram', label: product?.ram, icon: <MdMemory size={14} /> },
                    ]
                      .filter((item) => item.label)
                      .map((item) => (
                        <div
                          key={item.key}
                          className="flex items-center gap-1.5 rounded-[4px] border border-primary/20 bg-primary/5 px-2.5 py-1.5 text-xs font-semibold text-primary"
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Phân cách */}
                <div className="h-[1px] w-full bg-black/5"></div>

                {/* Description Text */}
                <div className="flex flex-col gap-2">
                  {product?.des ? (
                    <p className="whitespace-pre-line text-[13px] leading-relaxed text-black/70">{product?.des}</p>
                  ) : (
                    <div className="flex flex-col gap-1 rounded-[4px] bg-black/5 p-3">
                      <p className="text-sm font-semibold text-black/80">Thiết kế chuẩn mực, hiệu năng vượt trội</p>
                      <p className="text-[12px] leading-relaxed text-black/60">
                        Sản phẩm mang đến trải nghiệm tối ưu, đáp ứng hoàn hảo nhu cầu khắt khe của giới công nghệ chuyên nghiệp.
                      </p>
                    </div>
                  )}
                </div>

                {/* Related Products Mini-Bento */}
                {relatedProducts && relatedProducts.length > 1 && (
                  <div className="flex flex-col gap-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-black/40">Tùy chọn khác</p>
                    <div className="grid grid-cols-2 gap-2">
                      {relatedProducts
                        .filter((item) => item._id !== product._id)
                        .slice(0, 4) // Giới hạn hiển thị để không làm vỡ layout
                        .map((item) => (
                          <Link
                            key={item._id}
                            href={`/${item.slug}`}
                            className="group flex items-center gap-2 rounded-[4px] border border-black/10 bg-white p-1.5 transition-all hover:border-primary/40 hover:shadow-sm"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[2px] bg-black/5">
                              <Image
                                src={item.img}
                                alt={item.name}
                                width={40}
                                height={40}
                                className="max-h-full max-w-full object-contain mix-blend-multiply transition-transform group-hover:scale-110"
                              />
                            </div>
                            <div className="flex flex-col overflow-hidden">
                              <p className="truncate text-[10px] font-bold uppercase text-black/70 group-hover:text-primary">{item.color}</p>
                              <p className="truncate text-[11px] font-bold text-price">{formatCurrency(item.price)}</p>
                            </div>
                          </Link>
                        ))}
                    </div>
                  </div>
                )}

                {/* Actions Box */}
                <div className="flex flex-col gap-3 pt-2">
                  <motion.button
                    whileTap={{ scale: isExcluded ? 1 : 0.98 }}
                    disabled={!!isExcluded}
                    className={`h-12 w-full rounded-md font-bold uppercase tracking-wide transition-all ${
                      isExcluded
                        ? 'cursor-not-allowed bg-black/5 text-black/40'
                        : 'bg-primary text-white shadow-[0_4px_14px_0_rgba(var(--primary-rgb),0.39)] hover:bg-primary/90 hover:shadow-[0_6px_20px_rgba(var(--primary-rgb),0.23)]'
                    }`}
                    onClick={() => {
                      if (isExcluded) return;
                      const productToBuy = {
                        _id: product?._id,
                        name: product?.name,
                        slug: product?.slug,
                        img: product?.img,
                        price: product?.price,
                        ram: product?.ram,
                        color: product?.color,
                        link: `${product?.slug}`,
                      };
                      localStorage.setItem('selectedProduct', JSON.stringify(productToBuy));
                      window.location.href = '/thanh-toan';
                    }}
                  >
                    {isExcluded ? 'Tạm Hết Hàng' : 'Mua Ngay'}
                  </motion.button>

                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-medium text-black/40">*Cam kết chính hãng 100%</span>
                    <button
                      onClick={() => handleProductShare(product.slug)}
                      className="flex items-center gap-1.5 text-[11px] font-bold text-[#1877F2] transition-opacity hover:opacity-80"
                    >
                      <FaFacebookSquare size={14} /> Chia sẻ
                    </button>
                  </div>
                </div>

                {/* Hotline Banner */}
                <Link
                  href={hotlineUrl}
                  className="group relative mt-2 overflow-hidden rounded-md border border-primary/10 bg-primary/5 p-3 text-center transition-colors hover:bg-primary/10"
                >
                  <p className="text-[11px] font-bold uppercase tracking-wider text-primary/60">Tư vấn trực tiếp</p>
                  <p className="mt-0.5 text-lg font-black tracking-tight text-primary transition-transform group-hover:scale-105">{contact}</p>
                </Link>
              </div>
            </div>
          </div>

          {/* Section: Cam Kết 7Teck (Trust Signals) */}
          <div id="cam-ket" className="mt-10 lg:mt-16">
            <h2 className="mb-4 text-lg font-bold uppercase tracking-tight text-black/90">Đặc quyền tại 7teck</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              {[
                { title: 'Nguyên Zin', desc: 'Máy nguyên bản đúng phiên bản quý khách chọn' },
                { title: 'Bảo Hành', desc: 'Bao test 7 ngày, bảo hành 3-12 tháng theo hãng' },
                { title: 'Trả Góp 0%', desc: 'Hỗ trợ thẻ tín dụng nhanh chóng, thủ tục đơn giản' },
                { title: 'Quà Tặng', desc: 'Tặng kèm cường lực và ốp lưng cao cấp miễn phí' },
              ].map((policy, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-1.5 rounded-md border border-black/5 bg-black/[0.02] p-4 transition-colors hover:border-primary/20 hover:bg-white hover:shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <IoMdCheckmarkCircleOutline className="text-primary" size={18} />
                    <h3 className="text-sm font-bold text-black/90">{policy.title}</h3>
                  </div>
                  <p className="text-[12px] leading-relaxed text-black/60">{policy.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Thông Số & Bài Viết */}
          <div id="thong-so" className="mt-10 lg:mt-16">
            {/* Floating Tabs */}
            <div className="relative mx-auto flex w-full max-w-sm rounded-[6px] border border-black/10 bg-black/5 p-1">
              {['specs', 'details'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative z-10 w-1/2 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                    activeTab === tab ? 'text-primary' : 'text-black/50 hover:text-black/80'
                  }`}
                >
                  {activeTab === tab && (
                    <motion.div
                      layoutId="active-tab"
                      className="absolute inset-0 -z-10 rounded-[4px] bg-white shadow-sm"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  {tab === 'specs' ? 'Thông Số' : 'Bài Viết'}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="mt-6 min-h-[400px]">
              <AnimatePresence mode="wait">
                {activeTab === 'specs' ? (
                  <motion.div
                    key="specs"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="overflow-hidden rounded-md border border-black/10 bg-white"
                  >
                    {fieldMap.map((group, index) => {
                      const hasData = group?.fields.some((field) => {
                        const groupKey = group.group as keyof Product['catalog'];
                        const groupValue = product?.catalog?.[groupKey] as Record<string, string>;
                        return groupValue?.[field.field];
                      });
                      if (!hasData) return null;

                      return (
                        <details key={group?.group} open={index < 2} className="group border-b border-black/5 last:border-none">
                          <summary className="flex cursor-pointer items-center justify-between bg-black/[0.02] px-4 py-3 transition-colors hover:bg-black/5">
                            <span className="text-xs font-bold uppercase tracking-wider text-black/80">{group?.name}</span>
                            <span className="transform text-black/40 transition-transform duration-300 group-open:rotate-180">
                              <IoIosArrowDropdownCircle size={18} />
                            </span>
                          </summary>
                          <div className="flex flex-col bg-white">
                            {group?.fields.map((field) => {
                              const groupKey = group.group as keyof Product['catalog'];
                              const groupValue = product?.catalog?.[groupKey] as Record<string, string>;
                              const fieldValue = groupValue?.[field.field];
                              if (!fieldValue) return null;

                              return (
                                <div
                                  key={field.field}
                                  className="flex flex-col justify-between gap-1 border-t border-black/5 px-4 py-2.5 sm:flex-row sm:items-center"
                                >
                                  <p className="w-1/3 text-[12px] font-medium text-black/50">{field?.name}</p>
                                  <p className="w-full text-[13px] font-semibold text-black/90 sm:w-2/3 sm:text-right">
                                    {Array.isArray(fieldValue) ? fieldValue.join(', ') : fieldValue}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </details>
                      );
                    })}
                  </motion.div>
                ) : (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="prose-sm prose-primary prose max-w-none rounded-md bg-white p-2 xl:p-6"
                  >
                    {product?.catalogContent?.trim() ? (
                      <div dangerouslySetInnerHTML={{ __html: product.catalogContent }} />
                    ) : (
                      <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-black/10 bg-black/5 py-12 text-center">
                        <p className="text-sm font-bold text-black/70">Chưa có bài viết đánh giá</p>
                        <p className="mt-1 text-[12px] text-black/40">Nội dung chi tiết cho sản phẩm này đang được cập nhật.</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* AdvancedContactSection */}
          <div className="mt-10 lg:mt-16">
            <AdvancedContactSection />
          </div>
        </div>
      </div>
    </div>
  );
}
