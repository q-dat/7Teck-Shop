'use client';
import { useEffect, useState } from 'react';
import { scrollToTopInstantly } from '@/utils/scrollToTop';
import { formatCurrency } from '@/utils/formatCurrency';
import ProductPlaceholders from '@/components/userPage/ProductPlaceholders';
import Pagination from '@/components/userPage/Pagination';
import HeaderResponsive from '@/components/userPage/ui/HeaderResponsive';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from 'react-daisyui';
import imageRepresent from '../../../../public/image-represent';
import { useImageErrorHandler } from '@/hooks/useImageErrorHandler';
import { IconType } from 'react-icons';
import { FaBoxOpen, FaDesktop, FaMicrochip, FaThLarge } from 'react-icons/fa';
import { MdMemory, MdMonitor, MdSdStorage } from 'react-icons/md';
import { motion } from 'framer-motion';

export interface ProductBase {
  _id: string;
  name: string;
  img: string;
  price: number;
  color: string;
  ram?: string;
  storage?: string;
  cpu?: string;
  lcd?: string;
  gpu?: string;
  sale: number;
  status?: string;
  variants?: ProductBase[];
  slug: string;
}
interface BrandItem {
  name: string;
  icon?: React.ReactNode;
}

interface ClientProductPageProps {
  products: ProductBase[];
  title: string;
  basePath: string;
  brands?: BrandItem[];
  filterNode?: React.ReactNode;
  onBrandSelect?: (brand: string | null) => void;
}

type SpecKey = Extract<keyof ProductBase, 'ram' | 'cpu' | 'storage' | 'lcd' | 'gpu'>;

const specsToShow: ReadonlyArray<{
  key: SpecKey;
  icon: IconType;
}> = [
  { key: 'ram', icon: MdMemory },
  { key: 'cpu', icon: FaMicrochip },
  { key: 'storage', icon: MdSdStorage },
  { key: 'lcd', icon: MdMonitor },
  { key: 'gpu', icon: FaDesktop },
];

const EXCLUDED_STATUSES = ['hết hàng', 'ngừng kinh doanh', 'ngưng bán'];

type BadgeConfig = {
  src: string;
  showText: boolean;
  containerClass: string;
  textClass: string;
};

const BADGE_CONFIG: Record<string, BadgeConfig> = {
  new: {
    src: imageRepresent.badgeNew,
    showText: false,
    containerClass: 'absolute -left-[10px] -top-[10px] z-20',
    textClass: '',
  },
  default: {
    src: imageRepresent.Status,
    showText: true,
    containerClass: 'absolute -left-[3px] top-0 z-20',
    textClass: 'absolute top-[1px] w-full pl-1 text-xs font-medium text-white',
  },
};

const getBadgeConfig = (status?: string): BadgeConfig => {
  if (!status) return BADGE_CONFIG.default;

  return BADGE_CONFIG[status.toLowerCase()] ?? BADGE_CONFIG.default;
};

type Props = {
  status?: string;
};

const ProductBadge = ({ status }: Props) => {
  if (!status) return null;

  const { src, showText, containerClass, textClass } = getBadgeConfig(status);

  return (
    <div className={containerClass}>
      <Image height={100} width={60} alt={status} loading="lazy" className="h-full w-[60px] select-none" src={src} />

      {showText && <p className={textClass}>{status}</p>}
    </div>
  );
};

export default function ClientProductPage({ products, title, basePath, brands = [], filterNode, onBrandSelect }: ClientProductPageProps) {
  const [loading, setLoading] = useState(true);

  // Image error
  const fallbackSrc = imageRepresent.Fallback;
  const { handleImageError, isImageErrored } = useImageErrorHandler();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Variants
  const [selectedVariants, setSelectedVariants] = useState<Record<string, ProductBase>>({});

  // State lưu brand đang chọn
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  useEffect(() => {
    scrollToTopInstantly();
    // Khi products thay đổi => tắt loading
    setLoading(false);
  }, [products]);

  const itemsPerPage = 24;
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);

  // Variants click
  const handleVariantClick = (productId: string, variant: ProductBase) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [productId]: variant,
    }));
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Handle chọn brand
  const handleBrandClick = async (brand: string | null) => {
    setSelectedBrand(brand);
    setCurrentPage(1);
    setLoading(true);
    if (onBrandSelect) {
      await onBrandSelect(brand); // chờ dữ liệu mới
    }
    // Khi products mới được set => useEffect sẽ tự setLoading(false)
  };

  return (
    <div>
      <HeaderResponsive Title_NavbarMobile={'7teck.vn'} />
      <div className="py-[60px] xl:pt-0">
        {/* Breadcrumb */}
        <div className="breadcrumbs px-[10px] py-2 text-sm text-black shadow xl:px-desktop-padding">
          <ul className="font-light">
            <li>
              <Link href="/">Trang Chủ</Link>
            </li>
            <li>
              <Link href={`/${basePath}`}>{title}</Link>
            </li>
          </ul>
        </div>

   {/* Filter Btn & Brands */}
   <div className="my-3 px-2 xl:px-desktop-padding">
          <div className="flex flex-wrap items-center gap-2">
            {/* Sort & Filter Component (PhoneFilterBar) */}
            {filterNode}

            {/* Vách ngăn (Divider) phân tách tinh tế giữa Filter và Brands */}
            <div className="hidden h-5 w-[1px] bg-black/10 md:block"></div>

            {/* Nút Tất cả */}
            <button
              className={`flex h-8 items-center gap-1.5 rounded-[4px] border px-3 text-[11px] font-semibold uppercase tracking-wide shadow-sm transition-all ${
                selectedBrand === null
                  ? 'border-primary bg-primary text-white'
                  : 'border-black/10 bg-white text-black/70 hover:border-primary/40 hover:text-primary'
              }`}
              onClick={() => handleBrandClick(null)}
            >
              <FaThLarge size={12} />
              Tất cả
            </button>

            {/* Danh sách Brands */}
            {brands.map((brand) => (
              <button
                key={brand.name}
                className={`flex h-8 items-center gap-1.5 rounded-[4px] border px-3 text-[11px] font-semibold uppercase tracking-wide shadow-sm transition-all ${
                  selectedBrand === brand.name
                    ? 'border-primary bg-primary text-white'
                    : 'border-black/10 bg-white text-black/70 hover:border-primary/40 hover:text-primary'
                }`}
                onClick={() => handleBrandClick(brand.name)}
              >
                {brand.icon && <span className="text-[12px]">{brand.icon}</span>}
                {brand.name}
              </button>
            ))}

            {/* Title & Slogan (Đẩy sát về lề phải trên Desktop) */}
            <div className="ml-auto hidden items-center gap-2 md:flex">
              <span className="rounded-[4px] bg-primary/5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                7teck.vn
              </span>
              <span className="text-[11px] font-medium italic text-black/40">
                Chất lượng bạn tin - Giá trị bạn giữ.
              </span>
            </div>
          </div>
        </div>

        {/* Product grid */}
        <div className="mt-4 px-2 xl:px-desktop-padding">
          <div className="w-full">
            <div className="grid w-full grid-flow-dense grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8">
              {loading ? (
                <ProductPlaceholders count={12} />
              ) : currentProducts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full flex flex-col items-center justify-center rounded-md border border-primary/20 bg-primary/5 py-16 text-center"
                >
                  <FaBoxOpen className="mb-4 text-5xl text-primary/40" />
                  <h2 className="text-lg font-semibold text-black/90">Không tìm thấy sản phẩm</h2>
                  <p className="mb-6 text-sm text-black/60">Hiện tại danh mục chưa có sản phẩm mới nào được cập nhật.</p>
                  <Link
                    href="/thiet-bi-da-qua-su-dung"
                    className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary/90"
                  >
                    Xem sản phẩm Like New
                  </Link>
                </motion.div>
              ) : (
                currentProducts.map((product, index) => {
                  const variant = selectedVariants[product._id] ? selectedVariants[product._id] : product;
                  const isErrored = isImageErrored(variant._id);
                  const src = isErrored || !variant.img ? fallbackSrc : variant?.img;
                  const isExcluded = variant.status && EXCLUDED_STATUSES.includes(variant.status.toLowerCase());

                  const isFeatured = index % 7 === 0;

                  return (
                    <motion.section
                      layout
                      key={variant?._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)' }}
                      className={`group relative flex flex-col overflow-hidden rounded-md border border-primary/10 bg-white transition-colors hover:border-primary/40 ${
                        isFeatured ? 'col-span-2' : 'col-span-1'
                      }`}
                    >
                      <Link href={`/${variant.slug}`} className={`relative flex w-full ${isFeatured ? 'flex-row' : 'flex-col'}`}>
                        {/* Image Container */}
                        <div
                          className={`relative flex shrink-0 items-center justify-center overflow-hidden bg-white p-2 ${
                            isFeatured ? 'aspect-square w-2/5' : 'aspect-[4/3] w-full'
                          }`}
                        >
                          <motion.div whileHover={{ scale: 1.08 }} transition={{ type: 'spring', stiffness: 200 }} className="h-full w-full">
                            <Image
                              src={src}
                              alt={variant.name}
                              height={240}
                              width={240}
                              className="h-full w-full object-contain mix-blend-multiply"
                              onError={() => handleImageError(variant._id)}
                            />
                          </motion.div>

                          {isExcluded && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/40 backdrop-blur-[1px]">
                              <span className="rounded bg-black/80 px-2 py-1 text-[10px] font-bold uppercase text-white">Hết hàng</span>
                            </div>
                          )}
                        </div>

                        {/* Text Content */}
                        <div className={`flex flex-col p-2 ${isFeatured ? 'w-3/5 justify-center' : 'w-full'}`}>
                          <h3 className="line-clamp-2 min-h-[34px] text-[13px] font-semibold leading-tight text-black/90 group-hover:text-primary">
                            {variant.name}
                          </h3>

                          {/* Chips - Cấu hình */}
                          <div className="mt-2 flex flex-wrap gap-1">
                            {specsToShow.map(({ key, icon: Icon }) => {
                              const value = variant[key];
                              if (!value) return null;
                              return (
                                <div
                                  key={key}
                                  className="flex items-center gap-1 rounded-[3px] border border-primary/5 bg-primary/5 px-1 py-0.5 text-[9px] font-medium text-primary/80"
                                >
                                  <Icon size={9} />
                                  <span className="max-w-[65px] truncate leading-none">{value}</span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Featured Slogan & Policies Full Text */}
                          {isFeatured && (
                            <div className="mt-2.5 flex flex-col gap-1 border-t border-black/5 pt-2">
                              <p className="line-clamp-1 text-[11px] leading-relaxed text-black/50">
                                <strong className="font-medium text-black/70">7teck.vn</strong> — Chất lượng bạn tin, Giá trị bạn giữ.
                              </p>
                              <ul className="flex flex-col gap-0.5 text-[10px] text-black/60">
                                <li className="flex items-center gap-1">
                                  <span className="h-1 w-1 rounded-full bg-green-500"></span> New Seal Chính Hãng 100%
                                </li>
                                <li className="flex items-center gap-1">
                                  <span className="h-1 w-1 rounded-full bg-blue-500"></span> Bảo hành 12 tháng theo hãng
                                </li>
                                <li className="flex items-center gap-1">
                                  <span className="h-1 w-1 rounded-full bg-red-500"></span> Bao test 7 ngày - Lỗi 1 đổi 1
                                </li>
                              </ul>
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Action Area (Bottom) */}
                      <div className="mt-auto px-2 pb-2">
                        {/* Price */}
                        <div className="flex items-baseline gap-1.5 pt-1.5">
                          <span className="text-sm font-bold text-price sm:text-base">{formatCurrency(variant?.price)}</span>
                          {variant?.sale !== 0 && <del className="text-[10px] text-black/30">{formatCurrency(variant?.sale)}</del>}
                        </div>

                        {/* Trust Micro-Tags cho tất cả các thẻ */}
                        <div className="mt-1 flex flex-wrap gap-1">
                          <span className="rounded-[2px] bg-green-50 px-1 py-[2px] text-[8px] font-semibold uppercase tracking-tight text-green-600">
                            New Seal
                          </span>
                          <span className="rounded-[2px] bg-blue-50 px-1 py-[2px] text-[8px] font-semibold uppercase tracking-tight text-blue-600">
                            Chính Hãng
                          </span>
                          <span className="rounded-[2px] bg-red-50 px-1 py-[2px] text-[8px] font-semibold uppercase tracking-tight text-red-600">
                            1 Đổi 1
                          </span>
                        </div>

                        {/* Variants Buttons */}
                        <div className="mt-2 flex min-h-[20px] flex-wrap gap-1">
                          {Array.isArray(product.variants) &&
                            product.variants.map((v) => (
                              <button
                                key={v._id}
                                onClick={() => handleVariantClick(product._id, v)}
                                className={`h-5 min-w-[24px] rounded-[2px] border px-1 text-[9px] font-medium transition-all ${
                                  selectedVariants[product._id]?._id === v._id
                                    ? 'border-primary bg-primary text-white shadow-sm'
                                    : 'border-black/10 bg-white text-black/60 hover:border-primary/40'
                                }`}
                              >
                                {v.color}
                              </button>
                            ))}
                        </div>

                        {/* Buy Button */}
                        <motion.div whileTap={{ scale: 0.98 }} className="mt-2">
                          <Button
                            disabled={!!isExcluded}
                            size="xs"
                            className={`h-7 min-h-0 w-full rounded-[4px] border-none text-[11px] font-bold uppercase tracking-wide transition-all ${
                              isExcluded ? 'bg-black/5 text-black/30' : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
                            }`}
                            onClick={() => {
                              if (isExcluded) return;
                              const productToBuy = {
                                _id: variant?._id,
                                name: variant?.name,
                                slug: variant?.slug,
                                img: variant?.img,
                                price: variant?.price,
                                ram: variant?.ram,
                                color: variant?.color,
                                link: `/${variant.slug}`,
                              };
                              localStorage.setItem('selectedProduct', JSON.stringify(productToBuy));
                              window.location.href = '/thanh-toan';
                            }}
                          >
                            {isExcluded ? 'Hết hàng' : 'Mua ngay'}
                          </Button>
                        </motion.div>
                      </div>

                      <ProductBadge status={variant?.status} />
                    </motion.section>
                  );
                })
              )}
            </div>
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onNextPage={handleNextPage} onPrevPage={handlePrevPage} />
        </div>
      </div>
    </div>
  );
}
