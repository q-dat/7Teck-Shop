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

// Interface
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

interface ClientProductPageProps {
  products: ProductBase[];
  title: string;
  basePath: string;
  brands?: string[];
  onBrandSelect?: (brand: string | null) => void;
}

export default function ClientProductPage({ products, title, basePath, brands = [], onBrandSelect }: ClientProductPageProps) {
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
    if (products.length >= 0) {
      setLoading(false);
    }
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
  const handleBrandClick = (brand: string | null) => {
    setSelectedBrand(brand);
    if (onBrandSelect) {
      onBrandSelect(brand);
    }
    setCurrentPage(1); // reset về page 1 khi filter
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
        {/* Brand filter buttons */}
        <div className="my-5 px-2 xl:px-desktop-padding">
          {brands.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <Button
                size="sm"
                className={`rounded-md border ${selectedBrand === null ? 'bg-primary text-white hover:bg-primary/80' : 'border-primary bg-white text-black'}`}
                onClick={() => handleBrandClick(null)}
              >
                Tất cả
              </Button>
              {brands.map((brand) => (
                <Button
                  key={brand}
                  size="sm"
                  className={`rounded-md border ${selectedBrand === brand ? 'bg-primary text-white hover:bg-primary/80' : 'border-primary bg-white text-black'}`}
                  onClick={() => handleBrandClick(brand)}
                >
                  {brand}
                </Button>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-10 px-2 xl:px-desktop-padding">
          {/* Product grid */}
          <div className="w-full">
            <div className="grid w-full grid-flow-row grid-cols-2 items-start gap-[10px] md:grid-cols-4 xl:grid-cols-6">
              {loading ? (
                <ProductPlaceholders count={12} />
              ) : currentProducts.length === 0 ? (
                <div className="col-span-full flex w-full items-center justify-center py-10">
                  <div className="max-w-3xl rounded-xl border border-dashed border-secondary bg-white px-6 py-8 text-center shadow-lg">
                    <h2 className="mb-3 text-xl font-semibold text-primary md:text-2xl">
                      Không tìm thấy sản phẩm <span className="text-red-500">NEW SEAL</span>
                    </h2>
                    <p className="mb-5 text-sm text-gray-600 md:text-base xl:text-lg">
                      Hiện tại danh mục <strong>New Seal</strong> chưa có sản phẩm nào được cập nhật.
                      <br />
                      Quý khách vui lòng tham khảo thêm các thiết bị đã qua sử dụng với chất lượng <strong>Like New</strong> tại mục bên dưới:
                    </p>
                    <Link href="/thiet-bi-da-qua-su-dung">
                      <span className="inline-block rounded-lg bg-primary px-5 py-3 text-sm font-bold uppercase text-white transition-all hover:bg-primary/80 md:text-base">
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
                  return (
                    <section
                      key={variant?._id}
                      className="group relative flex h-full w-full flex-col justify-between rounded-md border border-primary-lighter text-black"
                    >
                      <Link aria-label="Xem chi tiết sản phẩm khi ấn vào hình ảnh" href={`${basePath}/${productUrl}/${subUrl}`}>
                        <div className="h-[200px] w-full cursor-pointer overflow-hidden rounded-md rounded-b-none bg-white">
                          <Image
                            src={src}
                            alt="Hình ảnh"
                            height={200}
                            width={200}
                            loading="lazy"
                            className="h-full w-full rounded-[5px] rounded-b-none object-contain transition-transform duration-1000 ease-in-out hover:scale-110"
                            onError={() => handleImageError(variant._id)}
                          />
                        </div>
                      </Link>
                      {/* Product Info */}
                      <div className="flex h-full w-full flex-col items-start justify-between p-1">
                        <div className="w-full">
                          <Link
                            aria-label="Xem chi tiết sản phẩm khi nhấn vào tên sản phẩm"
                            href={`${basePath}/${productUrl}/${subUrl}`}
                            className="w-full cursor-pointer"
                          >
                            <p className="text-prod-name-mobile font-medium xl:text-prod-name-desktop xl:group-hover:text-secondary">
                              <span>{title}</span>
                              &nbsp;
                              <span>{variant.name}</span>
                            </p>
                          </Link>
                          {/* Product Specifications */}
                          <div className="py-1 text-prod-name-mobile xl:text-prod-name-desktop">
                            {specsToShow.map((field) => {
                              const value = variant[field as keyof ProductBase];
                              if (!value) return null;

                              const fieldLabelMap: Record<string, string> = {
                                ram: 'RAM',
                                cpu: 'CPU',
                                lcd: 'Màn hình',
                                gpu: 'GPU',
                              };

                              return (
                                <p key={field}>
                                  <span className="rounded-sm bg-primary-lighter px-1 font-semibold">{fieldLabelMap[field]}:</span>
                                  &nbsp;<span className="font-light">{typeof value === 'string' || typeof value === 'number' ? value : ''}</span>
                                </p>
                              );
                            })}
                          </div>
                        </div>
                        {/* Select Product */}
                        <div className="w-full">
                          {Array.isArray(product.variants) && product.variants.length > 1 && (
                            <div className="flex flex-wrap items-center gap-1 py-1">
                              {product.variants.map((v) => (
                                <Button
                                  key={v._id}
                                  size="xs"
                                  className={`rounded-sm p-1 text-xs font-light ${
                                    selectedVariants[product._id]?._id === v._id
                                      ? 'border-primary bg-primary text-white hover:bg-primary'
                                      : 'border-gray-300 text-black hover:border-primary'
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
                            size="xs"
                            className="mt-1 w-full rounded-md border border-primary/20 bg-primary bg-opacity-10 text-primary hover:bg-primary hover:bg-opacity-20"
                            onClick={() => {
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
                            Mua Ngay
                          </Button>
                        </div>
                      </div>
                      {/*  */}
                      {variant?.status && (
                        <div className="absolute -left-[3px] top-0 z-20">
                          <Image height={100} width={60} alt="" loading="lazy" className="h-full w-[60px]" src={imageRepresent.Status} />
                          <p className="absolute top-[1px] w-full pl-1 text-xs text-white">{variant?.status}</p>
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
