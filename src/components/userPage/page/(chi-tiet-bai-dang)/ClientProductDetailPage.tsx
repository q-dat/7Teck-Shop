'use client';

import { LoadingLocal } from '@/components/orther/loading';
import Button from '@/components/ui/Button';
import HeaderResponsive from '@/components/userPage/ui/HeaderResponsive';
import { handleProductShare } from '@/helper/handleShare';
import { useImageErrorHandler } from '@/hooks/useImageErrorHandler';
import { formatCurrency } from '@/utils/formatCurrency';
import { scrollToTopInstantly } from '@/utils/scrollToTop';
import { contact, hotlineUrl } from '@/utils/socialLinks';
import { AnimatePresence, motion } from 'framer-motion';
import Image, { type StaticImageData } from 'next/image';
import Link from 'next/link';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { FaFacebookSquare, FaHeadset, FaShieldAlt, FaTools, FaTruck } from 'react-icons/fa';
import { IoIosArrowDropdownCircle } from 'react-icons/io';
import {
  MdClose,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdMemory,
  MdOutlineInvertColors,
  MdOutlinePhotoLibrary,
  MdVerified,
} from 'react-icons/md';
import { TfiRulerPencil } from 'react-icons/tfi';
import AdvancedContactSection from '../../AdvancedContactSection';
import imageRepresent from '../../../../../public/image-represent';

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

type CatalogFieldValue = string | number | string[] | null | undefined;

type ImageSource = string | StaticImageData;

interface VisibleSpecGroup extends FieldMap {
  fields: { field: string; name: string }[];
}

interface StatusStyle {
  label: string;
  className: string;
  note: string;
}

interface ServicePolicy {
  title: string;
  desc: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const EXCLUDED_STATUSES = ['Ngừng kinh doanh', 'Hết hàng', 'Ngưng bán'];

const BUY_BOX_POLICIES = [
  'Bao test rõ ràng trước khi nhận máy',
  'Tư vấn đúng nhu cầu, báo đúng tình trạng máy',
  'Hỗ trợ giao nhanh trong nội thành TP.HCM',
];

const SERVICE_POLICIES: ServicePolicy[] = [
  {
    title: 'Kiểm tra rõ tình trạng',
    desc: 'Thông tin sản phẩm, hình ảnh và cấu hình được trình bày rõ để khách dễ kiểm tra trước khi mua.',
    icon: FaShieldAlt,
  },
  {
    title: 'Tư vấn đúng nhu cầu',
    desc: 'Hỗ trợ chọn máy theo nhu cầu sử dụng, ngân sách và tình trạng thực tế của từng sản phẩm.',
    icon: FaHeadset,
  },
  {
    title: 'Hỗ trợ phần mềm',
    desc: 'Hỗ trợ cài đặt, kiểm tra và tư vấn sử dụng trong quá trình dùng máy.',
    icon: FaTools,
  },
  {
    title: 'Giao máy linh hoạt',
    desc: 'Hỗ trợ giao máy trong nội thành TP.HCM theo tình trạng sẵn có.',
    icon: FaTruck,
  },
];

export default function ClientProductDetailPage({ product, fieldMap, namePrefix, relatedProducts = [] }: ClientProductDetailPageProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAlbumOpen, setIsAlbumOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fallbackSrc = imageRepresent.Fallback;
  const { handleImageError, isImageErrored } = useImageErrorHandler();

  const isErrored = isImageErrored(product?._id);
  const isExcluded = Boolean(product?.status && EXCLUDED_STATUSES.includes(product.status));
  const productTitle = `${namePrefix} ${product?.name || ''}`.trim();

  const galleryImages = useMemo(() => {
    const images = [product?.img, ...(product?.thumbnail || [])].filter((image): image is string => Boolean(image));

    return Array.from(new Set(images));
  }, [product?.img, product?.thumbnail]);

  const selectedImageSrc: ImageSource = useMemo(() => {
    if (isErrored) return fallbackSrc;

    return galleryImages[selectedImageIndex] || product?.img || fallbackSrc;
  }, [fallbackSrc, galleryImages, isErrored, product?.img, selectedImageIndex]);

  const visibleSpecGroups = useMemo<VisibleSpecGroup[]>(() => {
    return fieldMap
      .map((group) => {
        const groupValue = product.catalog?.[group.group];

        const fields = group.fields.filter((field) => {
          const fieldValue = groupValue?.[field.field];

          if (Array.isArray(fieldValue)) return fieldValue.length > 0;

          return fieldValue !== null && fieldValue !== undefined && String(fieldValue).trim() !== '';
        });

        return {
          ...group,
          fields,
        };
      })
      .filter((group) => group.fields.length > 0);
  }, [fieldMap, product.catalog]);

  const primarySpecs = useMemo(() => {
    const values: { label: string; value: CatalogFieldValue }[] = [];

    visibleSpecGroups.forEach((group) => {
      const groupValue = product.catalog?.[group.group];

      group.fields.forEach((field) => {
        if (values.length >= 6) return;

        values.push({
          label: field.name,
          value: groupValue?.[field.field],
        });
      });
    });

    return values;
  }, [product.catalog, visibleSpecGroups]);

  const availableRelatedProducts = useMemo(() => {
    return relatedProducts.filter((item) => item._id !== product._id).slice(0, 6);
  }, [product._id, relatedProducts]);

  const handleScrollTo = useCallback(
    (targetId: string) => (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
      event.preventDefault();

      const target = document.getElementById(targetId);

      if (!target) return;

      const offset = window.innerWidth >= 1280 ? 88 : 68;
      const y = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top: y, behavior: 'smooth' });
    },
    []
  );

  const handleBuyNow = useCallback(() => {
    if (isExcluded) return;

    const productToBuy = {
      _id: product._id,
      name: product.name,
      slug: product.slug,
      img: product.img,
      price: product.price,
      ram: product.ram,
      color: product.color,
      link: product.slug,
    };

    localStorage.setItem('selectedProduct', JSON.stringify(productToBuy));
    window.location.href = '/thanh-toan';
  }, [isExcluded, product]);

  useLayoutEffect(() => {
    if (product && product.catalog) {
      setLoading(false);
    }
  }, [product]);

  useEffect(() => {
    scrollToTopInstantly();
  }, [product]);

  if (loading || !product || !product.catalog) {
    return <LoadingLocal />;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-slate-950">
      <HeaderResponsive Title_NavbarMobile="7teck.vn" />

      <main className="pb-20 pt-[60px] xl:pt-0">
        <ProductBreadcrumb productTitle={productTitle} />

        <section className="px-2 py-2 xl:px-desktop-padding xl:py-4">
          <ProductHeader productTitle={productTitle} status={product.status} isExcluded={isExcluded} />

          <div className="mt-2 grid grid-cols-1 gap-2 xl:grid-cols-[minmax(0,7fr)_minmax(380px,5fr)] xl:gap-4">
            <ProductGallery
              productId={product._id}
              productTitle={productTitle}
              images={galleryImages}
              selectedImageIndex={selectedImageIndex}
              selectedImageSrc={selectedImageSrc}
              fallbackSrc={fallbackSrc}
              isExcluded={isExcluded}
              setSelectedImageIndex={setSelectedImageIndex}
              setIsAlbumOpen={setIsAlbumOpen}
              handleImageError={handleImageError}
            />

            <ProductBuyBox
              product={product}
              fallbackSrc={fallbackSrc}
              isExcluded={isExcluded}
              availableRelatedProducts={availableRelatedProducts}
              handleBuyNow={handleBuyNow}
              handleScrollTo={handleScrollTo}
            />
          </div>
        </section>

        <section id="cam-ket" className="px-2 xl:px-desktop-padding">
          <div className="grid grid-cols-1 gap-2 xl:grid-cols-4">
            {SERVICE_POLICIES.map((policy) => (
              <ServicePolicyCard key={policy.title} title={policy.title} desc={policy.desc} icon={policy.icon} />
            ))}
          </div>
        </section>

        <section id="noi-dung-san-pham" className="mt-2 px-2 xl:px-desktop-padding">
          <div className="grid grid-cols-1 gap-2 xl:grid-cols-[minmax(0,8fr)_minmax(320px,4fr)] xl:gap-4">
            <div className="flex min-w-0 flex-col gap-2">
              <ProductDescriptionSection des={product.des} />
              {primarySpecs.length > 0 && (
                <div className="mt-2 grid grid-cols-2 gap-2 xl:grid-cols-6">
                  {primarySpecs.map((item) => (
                    <SpecHighlight key={item.label} label={item.label} value={item.value} />
                  ))}
                </div>
              )}
              <ProductArticleSection catalogContent={product.catalogContent} />
            </div>

            <ProductSpecificationSidebar visibleSpecGroups={visibleSpecGroups} catalog={product.catalog} />
          </div>
        </section>

        <section className="mt-2 px-2 xl:px-desktop-padding">
          <AdvancedContactSection />
        </section>

        <MobileBottomCTA isExcluded={isExcluded} handleBuyNow={handleBuyNow} />
      </main>

      <ProductAlbumModal
        isOpen={isAlbumOpen}
        images={galleryImages}
        productTitle={productTitle}
        selectedImageIndex={selectedImageIndex}
        selectedImageSrc={selectedImageSrc}
        fallbackSrc={fallbackSrc}
        setSelectedImageIndex={setSelectedImageIndex}
        setIsOpen={setIsAlbumOpen}
      />
    </div>
  );
}

function ProductBreadcrumb({ productTitle }: { productTitle: string }) {
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="px-2 py-2 xl:px-desktop-padding">
        <ul className="flex items-center gap-2 overflow-hidden text-xs font-bold uppercase tracking-wide text-slate-400">
          <li className="shrink-0">
            <Link href="/" className="transition-colors hover:text-secondary">
              Trang chủ
            </Link>
          </li>
          <li className="shrink-0">/</li>
          <li className="line-clamp-1 text-slate-700">{productTitle}</li>
        </ul>
      </div>
    </section>
  );
}

function ProductHeader({ productTitle, status, isExcluded }: { productTitle: string; status?: string; isExcluded: boolean }) {
  const statusStyle = getProductStatusStyle(status);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="h-1 bg-gradient-to-r from-secondary via-[#111827] to-price" />

      <div className="flex flex-col gap-2 p-2 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-secondary">Chi Tiết Sản Phẩm</p>
          <h1 className="mt-1 text-xl font-bold leading-tight tracking-tight text-slate-950 xl:text-3xl">{productTitle}</h1>
        </div>

        {status && (
          <div
            className={`flex w-fit shrink-0 items-center gap-2 rounded-md border px-2 py-2 shadow-sm ${
              isExcluded ? 'border-slate-200 bg-slate-100 text-slate-500' : statusStyle.className
            }`}
          >
            <MdVerified size={18} />
            <div>
              <p className="text-xs font-black uppercase leading-none tracking-wide">{isExcluded ? status : statusStyle.label}</p>
              <p className="mt-1 text-xs font-semibold leading-none opacity-75">{isExcluded ? 'Sản phẩm chưa sẵn hàng' : statusStyle.note}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductGallery({
  productId,
  productTitle,
  images,
  selectedImageIndex,
  selectedImageSrc,
  fallbackSrc,
  isExcluded,
  setSelectedImageIndex,
  setIsAlbumOpen,
  handleImageError,
}: {
  productId: string;
  productTitle: string;
  images: string[];
  selectedImageIndex: number;
  selectedImageSrc: ImageSource;
  fallbackSrc: ImageSource;
  isExcluded: boolean;
  setSelectedImageIndex: React.Dispatch<React.SetStateAction<number>>;
  setIsAlbumOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleImageError: (id: string) => void;
}) {
  const thumbnailRef = useRef<HTMLDivElement>(null);

  const imageCount = images.length;
  const hasMultipleImages = imageCount > 1;

  const goPrev = useCallback(() => {
    if (!hasMultipleImages) return;

    setSelectedImageIndex((current) => (current <= 0 ? imageCount - 1 : current - 1));
  }, [hasMultipleImages, imageCount, setSelectedImageIndex]);

  const goNext = useCallback(() => {
    if (!hasMultipleImages) return;

    setSelectedImageIndex((current) => (current >= imageCount - 1 ? 0 : current + 1));
  }, [hasMultipleImages, imageCount, setSelectedImageIndex]);

  const scrollThumbnails = useCallback((direction: 'left' | 'right') => {
    const container = thumbnailRef.current;

    if (!container) return;

    container.scrollBy({
      left: direction === 'left' ? -240 : 240,
      top: direction === 'left' ? -240 : 240,
      behavior: 'smooth',
    });
  }, []);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="grid grid-cols-1 gap-2 p-2 xl:grid-cols-[86px_minmax(0,1fr)]">
        <div className="order-2 xl:order-1">
          <div className="relative">
            <div
              ref={thumbnailRef}
              className="flex gap-2 overflow-x-auto scroll-smooth py-1 scrollbar-hide xl:max-h-[590px] xl:flex-col xl:overflow-y-auto xl:overflow-x-hidden"
            >
              {images.length > 0 ? (
                images.map((image, index) => {
                  const isActive = selectedImageIndex === index;

                  return (
                    <Button variant="unstyled"
                      type="button"
                      key={`${image}-${index}`}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`group relative flex h-[62px] w-[62px] shrink-0 items-center justify-center overflow-hidden rounded-md border bg-white transition-all xl:h-20 xl:w-20 ${
                        isActive ? 'border-secondary ring-2 ring-secondary/25' : 'border-slate-200 hover:border-secondary/60'
                      }`}
                    >
                      <Image
                        width={96}
                        height={96}
                        loading="lazy"
                        src={image || fallbackSrc}
                        alt={`${productTitle} ảnh ${index + 1}`}
                        className="max-h-full max-w-full object-contain p-1 mix-blend-multiply transition-transform group-hover:scale-105"
                      />

                      {isActive && <span className="absolute inset-x-2 bottom-1 h-[2px] rounded-full bg-secondary" />}
                    </Button>
                  );
                })
              ) : (
                <div className="flex h-[62px] items-center justify-center rounded-md border border-dashed border-slate-200 px-2 text-xs text-slate-400">
                  Không có ảnh
                </div>
              )}
            </div>

            {hasMultipleImages && (
              <div className="mt-2 hidden grid-cols-2 gap-1 xl:grid">
                <Button variant="unstyled"
                  type="button"
                  onClick={() => scrollThumbnails('left')}
                  className="flex h-8 items-center justify-center rounded-md border border-slate-200 bg-[#f5f5f7] text-slate-700 transition-colors hover:border-secondary/50 hover:text-secondary"
                >
                  <MdKeyboardArrowLeft size={20} />
                </Button>

                <Button variant="unstyled"
                  type="button"
                  onClick={() => scrollThumbnails('right')}
                  className="flex h-8 items-center justify-center rounded-md border border-slate-200 bg-[#f5f5f7] text-slate-700 transition-colors hover:border-secondary/50 hover:text-secondary"
                >
                  <MdKeyboardArrowRight size={20} />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="order-1 min-w-0 xl:order-2">
          <div
            role="button"
            tabIndex={0}
            onClick={() => setIsAlbumOpen(true)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setIsAlbumOpen(true);
              }
            }}
            className="relative flex aspect-square w-full cursor-zoom-in items-center justify-center overflow-hidden rounded-lg bg-[radial-gradient(circle_at_top,#ffffff_0%,#f5f5f7_45%,#eef1f6_100%)] outline-none transition-colors hover:bg-[#f7f8fb] xl:aspect-[16/11]"
          >
            <Image
              priority
              width={1100}
              height={1100}
              src={selectedImageSrc}
              alt={productTitle || 'Hình ảnh sản phẩm'}
              className="max-h-full max-w-full object-contain p-2 mix-blend-multiply xl:p-6"
              onError={() => handleImageError(productId)}
            />

            <div className="absolute left-2 top-2 flex items-center gap-2">
              <span className="inline-flex h-9 items-center gap-1.5 rounded-md border border-slate-200 bg-white/95 px-2 text-xs font-bold text-slate-800 shadow-sm backdrop-blur transition-colors hover:border-secondary/50 hover:text-secondary">
                <MdOutlinePhotoLibrary size={16} />
                Album
              </span>

              {imageCount > 0 && (
                <span className="rounded-md border border-slate-200 bg-white/95 px-2 py-2 text-xs font-bold text-slate-600 shadow-sm backdrop-blur">
                  {selectedImageIndex + 1}/{imageCount}
                </span>
              )}
            </div>

            {hasMultipleImages && (
              <>
                <Button variant="unstyled"
                  type="button"
                  onClick={(event: React.MouseEvent<HTMLElement>) => {
                    event.stopPropagation();
                    goPrev();
                  }}
                  className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md border border-slate-200 bg-white/95 text-slate-800 shadow-sm backdrop-blur transition-colors hover:border-secondary/50 hover:text-secondary"
                >
                  <MdKeyboardArrowLeft size={24} />
                </Button>

                <Button variant="unstyled"
                  type="button"
                  onClick={(event: React.MouseEvent<HTMLElement>) => {
                    event.stopPropagation();
                    goNext();
                  }}
                  className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md border border-slate-200 bg-white/95 text-slate-800 shadow-sm backdrop-blur transition-colors hover:border-secondary/50 hover:text-secondary"
                >
                  <MdKeyboardArrowRight size={24} />
                </Button>
              </>
            )}

            <span className="absolute bottom-2 left-2 rounded-md border border-slate-200 bg-white/95 px-2 py-2 text-xs font-bold text-slate-700 shadow-sm backdrop-blur">
              Nhấn vào ảnh để xem lớn
            </span>

            {isExcluded && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
                <Image
                  src={imageRepresent.soldOut}
                  alt="Tạm hết hàng"
                  height={170}
                  width={170}
                  loading="lazy"
                  className="h-[120px] w-[120px] object-contain drop-shadow-md xl:h-[170px] xl:w-[170px]"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductAlbumModal({
  isOpen,
  images,
  productTitle,
  selectedImageIndex,
  selectedImageSrc,
  fallbackSrc,
  setSelectedImageIndex,
  setIsOpen,
}: {
  isOpen: boolean;
  images: string[];
  productTitle: string;
  selectedImageIndex: number;
  selectedImageSrc: ImageSource;
  fallbackSrc: ImageSource;
  setSelectedImageIndex: React.Dispatch<React.SetStateAction<number>>;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const imageCount = images.length;
  const hasMultipleImages = imageCount > 1;

  const [rotateDeg, setRotateDeg] = useState(0);

  const closeAlbum = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const goPrev = useCallback(() => {
    if (!hasMultipleImages) return;

    setSelectedImageIndex((current) => (current <= 0 ? imageCount - 1 : current - 1));
  }, [hasMultipleImages, imageCount, setSelectedImageIndex]);

  const goNext = useCallback(() => {
    if (!hasMultipleImages) return;

    setSelectedImageIndex((current) => (current >= imageCount - 1 ? 0 : current + 1));
  }, [hasMultipleImages, imageCount, setSelectedImageIndex]);

  const rotateLeft = useCallback(() => {
    setRotateDeg((current) => current - 90);
  }, []);

  const rotateRight = useCallback(() => {
    setRotateDeg((current) => current + 90);
  }, []);

  const resetRotate = useCallback(() => {
    setRotateDeg(0);
  }, []);

  useEffect(() => {
    resetRotate();
  }, [selectedImageIndex, resetRotate]);

  useEffect(() => {
    if (!isOpen) {
      resetRotate();
    }
  }, [isOpen, resetRotate]);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeAlbum();
      if (event.key === 'ArrowLeft') goPrev();
      if (event.key === 'ArrowRight') goNext();
      if (event.key.toLowerCase() === 'q') rotateLeft();
      if (event.key.toLowerCase() === 'e') rotateRight();
      if (event.key.toLowerCase() === 'r') resetRotate();
    };

    window.addEventListener('keydown', handleKeydown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [closeAlbum, goNext, goPrev, isOpen, resetRotate, rotateLeft, rotateRight]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-modal bg-[#000000]/95 text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex h-full flex-col gap-2 py-[60px] xl:py-0">
            <header className="border-b border-white/10 bg-black/40 p-2 backdrop-blur-xl">
              <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-secondary">Album Sản Phẩm</p>
                  <h2 className="line-clamp-1 text-sm font-bold leading-6 text-white xl:text-xl">{productTitle}</h2>
                </div>

                <div className="flex min-w-0 items-center gap-2 overflow-x-auto pb-1 scrollbar-hide xl:pb-0">
                  <span className="flex h-9 shrink-0 items-center rounded-md border border-white/10 bg-white/5 px-3 text-xs font-bold text-white/80">
                    {imageCount > 0 ? selectedImageIndex + 1 : 0}/{imageCount}
                  </span>

                  <Button
                    type="button"
                    onClick={rotateLeft}
                    className="flex h-9 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5 px-3 text-xs font-bold text-white transition-colors hover:bg-white/10"
                  >
                    Xoay trái
                  </Button>

                  <Button
                    type="button"
                    onClick={rotateRight}
                    className="flex h-9 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5 px-3 text-xs font-bold text-white transition-colors hover:bg-white/10"
                  >
                    Xoay phải
                  </Button>

                  {rotateDeg !== 0 && (
                    <Button
                      type="button"
                      onClick={resetRotate}
                      className="flex h-9 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5 px-3 text-xs font-bold text-white/80 transition-colors hover:bg-white/10"
                    >
                      Reset
                    </Button>
                  )}

                  <Button variant="unstyled"
                    type="button"
                    onClick={closeAlbum}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10"
                  >
                    <MdClose size={22} />
                  </Button>
                </div>
              </div>
            </header>

            <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden">
              <Image
                priority
                width={1500}
                height={1500}
                src={selectedImageSrc || fallbackSrc}
                alt={`${productTitle} album`}
                className="max-h-full max-w-full object-contain transition-transform duration-300 ease-out"
                style={{
                  transform: `rotate(${rotateDeg}deg)`,
                }}
              />

              {hasMultipleImages && (
                <>
                  <Button variant="unstyled"
                    type="button"
                    onClick={goPrev}
                    className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md border border-white/10 bg-white text-primary backdrop-blur transition-colors hover:bg-primary hover:text-white xl:left-4"
                  >
                    <MdKeyboardArrowLeft size={30} />
                  </Button>

                  <Button variant="unstyled"
                    type="button"
                    onClick={goNext}
                    className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md border border-white/10 bg-white text-primary backdrop-blur transition-colors hover:bg-primary hover:text-white xl:right-4"
                  >
                    <MdKeyboardArrowRight size={30} />
                  </Button>
                </>
              )}
            </div>

            {images.length > 0 && (
              <div className="border-t border-white/10 bg-black/20 p-2 xl:p-2">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {images.map((image, index) => {
                    const isActive = selectedImageIndex === index;

                    return (
                      <Button variant="unstyled"
                        type="button"
                        key={`${image}-${index}`}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-transparent transition-colors xl:h-20 xl:w-20 ${
                          isActive ? 'border-2 border-dashed border-white' : 'border-white/10 opacity-30 hover:opacity-100'
                        }`}
                      >
                        <Image
                          src={image || fallbackSrc}
                          alt={`${productTitle} album ${index + 1}`}
                          width={96}
                          height={96}
                          className="max-h-full max-w-full rounded-md object-cover p-1"
                        />
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ProductBuyBox({
  product,
  fallbackSrc,
  isExcluded,
  availableRelatedProducts,
  handleBuyNow,
  handleScrollTo,
}: {
  product: Product;
  fallbackSrc: ImageSource;
  isExcluded: boolean;
  availableRelatedProducts: Product[];
  handleBuyNow: () => void;
  handleScrollTo: (targetId: string) => (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
}) {
  return (
    <aside className="xl:sticky xl:top-[130px] xl:self-start">
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-white p-2">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Giá bán tại 7Teck</p>

          <div className="mt-1">
            {product.price === 0 ? (
              <Link href="/thong-tin-lien-he" className="text-3xl font-black tracking-tight text-price hover:underline xl:text-4xl">
                Liên hệ báo giá
              </Link>
            ) : (
              <div className="flex flex-wrap items-end gap-2">
                <span className="text-3xl font-black tracking-tight text-price xl:text-4xl">{formatCurrency(product.price)}</span>

                {hasValidSalePrice(product.price, product.sale) && (
                  <del className="pb-1 text-sm font-semibold text-slate-400">{formatCurrency(product.sale)}</del>
                )}
              </div>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {product.status && <ProductStatusBadge status={product.status} isExcluded={isExcluded} />}

            {product.color && (
              <span className="inline-flex items-center gap-1 rounded bg-secondary/10 px-2 py-1 text-xs font-bold text-secondary">
                <MdOutlineInvertColors size={14} />
                {product.color}
              </span>
            )}

            {product.ram && (
              <span className="inline-flex items-center gap-1 rounded bg-secondary/10 px-2 py-1 text-xs font-bold text-secondary">
                <MdMemory size={14} />
                {product.ram}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2 p-2">
          <div className="rounded-md bg-[#f5f5f7] p-2">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Thông tin nhanh</p>

            {product?.des ? (
              <div className="mt-1">
                <p className="line-clamp-6 whitespace-pre-line text-xs leading-relaxed text-slate-700">{product?.des.trim()}</p>

                <Link
                  href="#noi-dung-san-pham"
                  onClick={handleScrollTo('noi-dung-san-pham')}
                  className="mt-1 inline-block text-xs font-bold text-secondary hover:underline"
                >
                  Xem nội dung chi tiết
                </Link>
              </div>
            ) : (
              <p className="mt-1 text-sm leading-6 text-slate-600">Thông tin chi tiết của sản phẩm đang được cập nhật.</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Button
              type="button"
              disabled={isExcluded}
              onClick={handleBuyNow}
              className={`h-11 rounded-md text-sm font-bold uppercase tracking-wide transition-colors ${
                isExcluded ? 'cursor-not-allowed bg-slate-100 text-slate-400' : 'bg-primary text-white hover:bg-primary/90'
              }`}
            >
              {isExcluded ? 'Tạm hết hàng' : 'Mua ngay'}
            </Button>

            <Link
              href={hotlineUrl}
              className="flex h-11 items-center justify-center rounded-md border border-secondary/30 bg-secondary/5 text-sm font-bold uppercase tracking-wide text-secondary transition-colors hover:bg-secondary/10"
            >
              Gọi/Zalo: {contact}
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-1 border-t border-slate-200 pt-2">
            {BUY_BOX_POLICIES.map((policy) => (
              <div key={policy} className="text-sm leading-6 text-slate-700">
                + {policy}
              </div>
            ))}
          </div>

          <Button variant="unstyled"
            type="button"
            onClick={() => handleProductShare(product.slug)}
            className="flex items-center gap-1.5 text-xs font-bold text-secondary transition-opacity hover:opacity-80"
          >
            <FaFacebookSquare size={15} />
            Chia sẻ sản phẩm
          </Button>
        </div>
      </div>

      {availableRelatedProducts.length > 0 && (
        <div className="mt-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Tùy chọn khác</p>
            <span className="text-xs text-slate-400">{availableRelatedProducts.length} mẫu</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {availableRelatedProducts.map((item) => (
              <Link
                key={item._id}
                href={`/${item.slug}`}
                className="group rounded-md border border-slate-200 p-2 transition-colors hover:border-secondary/50"
              >
                <div className="flex h-16 items-center justify-center rounded-md bg-[#f5f5f7]">
                  <Image
                    src={item.img || fallbackSrc}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="max-h-full max-w-full object-contain p-1 mix-blend-multiply transition-transform group-hover:scale-105"
                  />
                </div>

                <div className="mt-1">
                  <p className="line-clamp-1 text-xs font-bold text-slate-700 group-hover:text-secondary">{item.color || item.ram || item.name}</p>
                  <p className="mt-0.5 text-sm font-semibold leading-5 text-price xl:text-2xl">
                    {item.price === 0 ? 'Liên hệ' : formatCurrency(item.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

function ProductStatusBadge({ status, isExcluded }: { status: string; isExcluded: boolean }) {
  const statusStyle = getProductStatusStyle(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-black uppercase tracking-wide ${
        isExcluded ? 'border-slate-200 bg-slate-100 text-slate-500' : statusStyle.className
      }`}
    >
      <MdVerified size={15} />
      {isExcluded ? status : statusStyle.label}
    </span>
  );
}

function SpecHighlight({ label, value }: { label: string; value: CatalogFieldValue }) {
  if (!isValidFieldValue(value)) return null;

  return (
    <div className="rounded-md border border-slate-200 bg-white p-2 transition-colors hover:border-secondary/30 hover:bg-primary-white">
      <p className="line-clamp-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</p>

      <p className="mt-0.5 line-clamp-2 text-xs font-bold leading-5 text-black">{renderCatalogValue(value)}</p>
    </div>
  );
}

function ServicePolicyCard({
  title,
  desc,
  icon: Icon,
}: {
  title: string;
  desc: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <div className="group rounded-lg border border-slate-200 bg-white p-2 shadow-sm transition-colors hover:border-secondary/30">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary/10 text-secondary transition-colors group-hover:bg-secondary group-hover:text-white">
          <Icon size={16} />
        </span>
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
      </div>

      <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
    </div>
  );
}

function ProductDescriptionSection({ des }: { des?: string }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
      <SectionHeader title="Mô tả sản phẩm" desc="Thông tin tổng quan được tách riêng để dễ đọc, không làm rối khu vực mua hàng." />

      {des?.trim() ? (
        <div className="mt-3 rounded-md bg-[#f5f5f7] p-2">
          <p className="font-sem whitespace-pre-line text-sm leading-relaxed text-slate-700">{des}</p>
        </div>
      ) : (
        <EmptyState title="Chưa có mô tả sản phẩm" desc="Nội dung mô tả cho sản phẩm này đang được cập nhật." />
      )}
    </section>
  );
}

function ProductArticleSection({ catalogContent }: { catalogContent?: string }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
      <SectionHeader title="Bài viết chi tiết" desc="Khu vực đọc nội dung dài với bố cục rõ ràng, phù hợp mô tả sản phẩm công nghệ." />

      {catalogContent?.trim() ? (
        <article
          className="prose-slate prose-headings:font-bold prose-h2:border-b prose-h2:border-slate-200 prose-h2:pb-2 prose-p:text-[15px] prose-p:leading-8 prose-p:text-slate-700 prose-li:text-[15px] prose-li:leading-8 prose-img:rounded-md prose-img:border prose-img:border-slate-200 prose-table:overflow-hidden prose-th:bg-[#f5f5f7] prose-th:p-2 prose-td:p-2 prose mt-3 max-w-none"
          dangerouslySetInnerHTML={{ __html: catalogContent }}
        />
      ) : (
        <EmptyState title="Chưa có bài viết đánh giá" desc="Nội dung chi tiết cho sản phẩm này đang được cập nhật." />
      )}
    </section>
  );
}

function ProductSpecificationSidebar({
  visibleSpecGroups,
  catalog,
}: {
  visibleSpecGroups: VisibleSpecGroup[];
  catalog: Record<string, ProductCatalogGroup>;
}) {
  return (
    <aside className="xl:sticky xl:top-[130px] xl:self-start">
      <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-950">Thông số kỹ thuật</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">Tổng hợp cấu hình và thông tin sản phẩm.</p>
          </div>

          <TfiRulerPencil className="shrink-0 text-secondary" size={20} />
        </div>

        {visibleSpecGroups.length > 0 ? (
          <div className="overflow-hidden rounded-md border border-slate-200">
            {visibleSpecGroups.map((group, index) => {
              const groupValue = catalog?.[group.group];

              return (
                <details key={group.group} open={index < 2} className="group border-b border-slate-200 last:border-b-0">
                  <summary className="flex cursor-pointer items-center justify-between bg-[#f5f5f7] px-2 py-3 transition-colors hover:bg-slate-100">
                    <span className="text-sm font-bold uppercase tracking-wide text-slate-900">{group.name}</span>
                    <span className="text-slate-400 transition-transform duration-300 group-open:rotate-180">
                      <IoIosArrowDropdownCircle size={18} />
                    </span>
                  </summary>

                  <div className="bg-white">
                    {group.fields.map((field) => {
                      const fieldValue = groupValue?.[field.field];

                      if (!isValidFieldValue(fieldValue)) return null;

                      return (
                        <div key={field.field} className="grid grid-cols-1 gap-1 border-t border-slate-100 px-2 py-2.5">
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{field.name}</p>
                          <p className="text-sm font-semibold leading-6 text-slate-950">{renderCatalogValue(fieldValue)}</p>
                        </div>
                      );
                    })}
                  </div>
                </details>
              );
            })}
          </div>
        ) : (
          <EmptyState title="Chưa có thông số" desc="Thông số kỹ thuật cho sản phẩm này đang được cập nhật." />
        )}
      </div>
    </aside>
  );
}

function MobileBottomCTA({ isExcluded, handleBuyNow }: { isExcluded: boolean; handleBuyNow: () => void }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white p-2 shadow-[0_-6px_20px_rgba(15,23,42,0.08)] xl:hidden">
      <div className="grid grid-cols-[1fr_1fr] gap-2">
        <Link
          href={hotlineUrl}
          className="flex h-11 items-center justify-center rounded-md border border-secondary/30 bg-secondary/5 text-sm font-bold text-secondary"
        >
          Gọi/Zalo
        </Link>

        <Button
          type="button"
          disabled={isExcluded}
          onClick={handleBuyNow}
          className={`h-11 rounded-md text-sm font-bold uppercase ${
            isExcluded ? 'cursor-not-allowed bg-slate-100 text-slate-400' : 'bg-secondary text-white'
          }`}
        >
          {isExcluded ? 'Tạm hết hàng' : 'Mua ngay'}
        </Button>
      </div>
    </div>
  );
}

function SectionHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div>
      <h2 className="text-lg font-bold tracking-tight text-slate-950 xl:text-2xl">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-slate-500">{desc}</p>
    </div>
  );
}

function EmptyState({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mt-3 flex min-h-[180px] flex-col items-center justify-center rounded-md border border-dashed border-slate-200 bg-[#f5f5f7] p-4 text-center">
      <p className="text-sm font-bold text-slate-700">{title}</p>
      <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">{desc}</p>
    </div>
  );
}

function hasValidSalePrice(price: number, sale: number): boolean {
  return Number.isFinite(sale) && sale > 0 && sale > price;
}

function getProductStatusStyle(status?: string): StatusStyle {
  const normalizedStatus = status?.trim().toLowerCase();

  if (!normalizedStatus) {
    return {
      label: '',
      className: 'border-slate-200 bg-slate-100 text-slate-600',
      note: '',
    };
  }

  if (normalizedStatus === 'newseal' || normalizedStatus === 'new seal') {
    return {
      label: 'New Seal',
      className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      note: 'Máy mới nguyên seal',
    };
  }

  if (normalizedStatus === 'likenew' || normalizedStatus === 'like new') {
    return {
      label: 'Like New',
      className: 'border-secondary/20 bg-secondary/10 text-secondary',
      note: 'Ngoại hình đẹp, tình trạng tốt',
    };
  }

  if (normalizedStatus === 'used') {
    return {
      label: 'Used',
      className: 'border-amber-200 bg-amber-100 text-amber-700',
      note: 'Máy đã qua sử dụng',
    };
  }

  return {
    label: status || '',
    className: 'border-slate-200 bg-slate-100 text-slate-700',
    note: 'Tình trạng sản phẩm',
  };
}

function isValidFieldValue(value: CatalogFieldValue): boolean {
  if (Array.isArray(value)) return value.length > 0;

  return value !== null && value !== undefined && String(value).trim() !== '';
}

function renderCatalogValue(value: CatalogFieldValue): string {
  if (Array.isArray(value)) return value.join(', ');
  if (value === null || value === undefined) return '';

  return String(value);
}
