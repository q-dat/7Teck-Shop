'use client';
import { useEffect, useState } from 'react';
import { slugify } from '@/utils/slugify';
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
import { MdMemory, MdMonitor, MdOutlineInvertColors } from 'react-icons/md';

interface ProductBase {
  _id: string;
  name: string;
  img: string;
  price: number;
  color: string;
  ram?: string;
  cpu?: string;
  lcd?: string;
  gpu?: string;
  sale?: number;
  status?: string;
  variants?: ProductBase[];
}
interface BrandItem {
  name: string;
  icon?: React.ReactNode;
}

interface SpecConfig {
  icon: IconType;
  label: string;
}

interface ClientProductPageProps {
  products: ProductBase[];
  title: string;
  basePath: string;
  brands?: BrandItem[];
  filterNode?: React.ReactNode;
  onBrandSelect?: (brand: string | null) => void;
}

const EXCLUDED_STATUSES = ['hết hàng', 'ngừng kinh doanh', 'ngưng bán'];
const specConfigMap: Record<string, SpecConfig> = {
  color: { icon: MdOutlineInvertColors, label: 'Màu sắc' },
  ram: { icon: MdMemory, label: 'RAM' },
  cpu: { icon: FaMicrochip, label: 'CPU' },
  lcd: { icon: MdMonitor, label: 'LCD' },
  gpu: { icon: FaDesktop, label: 'GPU' },
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
  const specsToShow = ['ram', 'cpu', 'lcd', 'gpu'];

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

        {/* Filter Btn */}
        <div className="my-2 px-2 xl:px-desktop-padding">
          {/* Brand */}
          <div className="flex flex-wrap gap-1">
            <Button
              size="sm"
              className={`rounded-sm border border-primary-lighter text-xs font-medium hover:border-primary ${selectedBrand === null ? 'bg-primary text-white hover:bg-primary xl:hover:bg-primary/80' : 'bg-white text-black'}`}
              onClick={() => handleBrandClick(null)}
            >
              <FaThLarge className="text-base" /> Tất cả
            </Button>
            {brands.map((brand) => (
              <Button
                key={brand.name}
                size="sm"
                className={`rounded-sm border border-primary-lighter text-xs font-medium hover:border-primary ${selectedBrand === brand.name ? 'bg-primary text-white hover:bg-primary xl:hover:bg-primary/80' : 'bg-white text-black'}`}
                onClick={() => handleBrandClick(brand.name)}
              >
                {brand.icon && <span className="text-base">{brand.icon}</span>}
                {brand.name}
              </Button>
            ))}
            {/* Title & Slogan */}
            <div className="my-2 ml-auto hidden text-center md:block">
              <p className="text-sm tracking-wide text-black">
                <span className="rounded-full bg-gradient-to-r from-primary/50 via-primary-lighter to-transparent px-3 py-1 font-semibold text-primary shadow-sm">
                  7teck.vn
                </span>
                <span className="ml-1 font-light italic">Chất lượng bạn tin - Giá trị bạn giữ.</span>
              </p>
            </div>
          </div>
          {/* Sort */}
          {filterNode}
        </div>

        {/* Product grid */}
        <div className="mt-4 space-y-10 px-2 xl:px-desktop-padding">
          <div className="w-full">
            <div className="grid w-full grid-flow-row grid-cols-2 items-start gap-[10px] md:grid-cols-4 xl:grid-cols-6">
              {loading ? (
                <ProductPlaceholders count={12} />
              ) : currentProducts.length === 0 ? (
                <div className="col-span-full flex w-full items-center justify-center p-2">
                  <div className="max-w-xl rounded-xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center shadow-md">
                    <div className="mb-5 flex justify-center text-secondary">
                      <FaBoxOpen className="text-6xl" />
                    </div>
                    {/* Tiêu đề */}
                    <h2 className="mb-3 text-lg font-semibold text-gray-800 md:text-xl">
                      Không tìm thấy sản phẩm <br />
                      <span className="text-primary">NEW SEAL</span>
                    </h2>
                    {/* Nội dung */}
                    <p className="mb-6 text-sm text-gray-600 md:text-base">
                      Hiện tại danh mục <strong>New Seal</strong> chưa có sản phẩm nào được cập nhật.
                      <br />
                      Quý khách vui lòng tham khảo thêm các thiết bị đã qua sử dụng với chất lượng <strong>Like New</strong> tại mục bên dưới:
                    </p>
                    {/* Nút CTA */}
                    <Link href="/thiet-bi-da-qua-su-dung">
                      <span className="inline-block rounded-lg bg-primary p-3 text-xs font-bold uppercase text-white transition-all hover:bg-primary/80 md:text-base xl:px-5 xl:py-3 xl:text-sm">
                        Xem thiết bị đã qua sử dụng
                      </span>
                    </Link>
                  </div>
                </div>
              ) : (
                currentProducts.map((product) => {
                  const variant = selectedVariants[product._id] ? selectedVariants[product._id] : product;
                  // Navigate
                  const productUrl = slugify(variant.name);
                  const subUrl = variant?._id;
                  // handleImageError
                  const isErrored = isImageErrored(variant._id);
                  const src = isErrored || !variant.img ? fallbackSrc : variant?.img;
                  const isExcluded = variant.status && EXCLUDED_STATUSES.includes(variant.status.toLowerCase());

                  return (
                    <section
                      key={variant?._id}
                      className="group relative flex h-full w-full flex-col justify-between rounded-md border border-primary-lighter text-black"
                    >
                      <div className="w-full">
                        <Link
                          className="relative"
                          aria-label="Xem chi tiết sản phẩm khi ấn vào hình ảnh"
                          target="_blank"
                          href={`${basePath}/${productUrl}/${subUrl}`}
                        >
                          {/* Product Image */}
                          <div className="h-[200px] w-full cursor-pointer overflow-hidden rounded-md rounded-b-none bg-white">
                            <Image
                              src={src}
                              alt="Hình ảnh"
                              height={200}
                              width={200}
                              loading="lazy"
                              className="h-full w-full rounded-[5px] rounded-b-none object-contain transition-transform duration-1000 ease-in-out group-hover:scale-110"
                              onError={() => handleImageError(variant._id)}
                            />
                          </div>
                          {/* Product Title & Specifications */}
                          <div className="w-full px-1 pt-1">
                            <p className="text-prod-name-mobile font-medium xl:text-prod-name-desktop xl:group-hover:text-primary">
                              <span>{title}</span>
                              &nbsp;
                              <span>{variant.name}</span>
                            </p>
                            {/* Product Specifications */}
                            <div className="w-full">
                              {specsToShow.map((field) => {
                                const value = variant[field as keyof ProductBase];
                                if (!value) return null;

                                const config = specConfigMap[field];
                                if (!config) return null;

                                const Icon = config.icon;

                                return (
                                  <div key={field} className="flex items-center">
                                    <Icon size={16} className="text-gray-600" />
                                    <span className="text-xs font-light">{typeof value === 'string' || typeof value === 'number' ? value : ''}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          {/* Overlay for Sold Out products */}
                          {isExcluded && (
                            <div className="pointer-events-none absolute inset-0 z-50 rounded-md">
                              {/* Glass/blur background */}
                              <div className="absolute inset-0 rounded-md backdrop-blur-[1px]"></div>
                              {/* Sold out image at top-left corner */}
                              <Image
                                src={imageRepresent.soldOut2}
                                alt="Hết hàng"
                                height={80}
                                width={80}
                                loading="lazy"
                                className="absolute -left-[5px] -top-[5px] z-50 h-[80px] w-[80px] object-contain"
                              />
                            </div>
                          )}
                        </Link>
                      </div>
                      {/* Select Product */}
                      <div className="w-full px-1 pb-1">
                        {Array.isArray(product.variants) && product.variants.length > 1 && (
                          <div className="flex flex-wrap items-center gap-1 py-1">
                            {product.variants.map((v) => (
                              <Button
                                key={v._id}
                                size="xs"
                                className={`rounded-md bg-white p-1 text-xs font-normal ${
                                  selectedVariants[product._id]?._id === v._id
                                    ? 'border-primary bg-primary-lighter text-primary hover:bg-primary-lighter'
                                    : 'border-spacing-px border-primary/40 text-black hover:border-primary'
                                }`}
                                onClick={() => handleVariantClick(product._id, v)}
                                title={v.color}
                              >
                                {v.color}
                              </Button>
                            ))}
                          </div>
                        )}
                        {/* Price and Buy Now Button */}
                        <p className="w-full text-prod-price-mobile xl:text-prod-price-desktop">
                          <span className="font-semibold text-price">{formatCurrency(variant?.price)}</span> &nbsp;
                          {variant?.sale && <del className="text-xs font-light text-gray-500">{formatCurrency(variant?.sale)}</del>}
                        </p>
                        <p className="text-xs text-gray-500">Hỗ trợ trả góp.</p>
                        <p className="text-xs text-gray-500">Miễn phí ship nội thành HCM.</p>
                        <Button
                          disabled={isExcluded ? true : false}
                          size="xs"
                          className={`mt-1 w-full rounded-md border border-primary/20 ${
                            isExcluded ? 'cursor-not-allowed' : 'bg-primary bg-opacity-10 text-primary hover:bg-primary hover:bg-opacity-20'
                          }`}
                          onClick={() => {
                            if (isExcluded) return;
                            const productToBuy = {
                              _id: variant?._id,
                              name: variant?.name,
                              img: variant?.img,
                              price: variant?.price,
                              ram: variant?.ram,
                              color: variant?.color,
                              link: `${basePath}/${productUrl}/${subUrl}`,
                            };
                            localStorage.setItem('selectedProduct', JSON.stringify(productToBuy));
                            window.location.href = '/thanh-toan';
                          }}
                        >
                          {isExcluded ? 'Không khả dụng' : 'Mua Ngay'}
                        </Button>
                      </div>
                      {/*  */}
                      {!isExcluded && variant?.status && (
                        <div className="absolute -left-[3px] top-0 z-20">
                          <Image height={100} width={60} alt="" loading="lazy" className="h-full w-[60px]" src={imageRepresent.Status} />
                          <p className="absolute top-[1px] w-full pl-1 text-xs font-medium text-white">{variant?.status}</p>
                        </div>
                      )}
                    </section>
                  );
                })
              )}
            </div>
          </div>
          {/* Pagination Controls */}
          <Pagination currentPage={currentPage} totalPages={totalPages} onNextPage={handleNextPage} onPrevPage={handlePrevPage} />
        </div>
      </div>
    </div>
  );
}
