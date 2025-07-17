'use client';
import { useEffect, useState } from 'react';
import { slugify } from '@/utils/slugify';
import { scrollToTopSmoothly } from '@/utils/scrollToTopSmoothly';
import { formatCurrency } from '@/utils/formatCurrency';
import ProductPlaceholders from '@/components/userPage/ProductPlaceholders';
import Pagination from '@/components/userPage/Pagination';
import HeaderResponsive from '@/components/userPage/HeaderResponsive';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from 'react-daisyui';
import imageRepresent from '../../../../public/image-represent';
import { useImageErrorHandler } from '@/hooks/useImageErrorHandler';

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
}

interface ClientProductPageProps {
  products: ProductBase[];
  title: string;
  basePath: string; // dùng để tạo link động, ví dụ '${basePath}' hay 'macbook'
}

export default function ClientProductPage({ products, title, basePath }: ClientProductPageProps) {
  const [loading, setLoading] = useState(true);
  //  handleImageError
  const fallbackSrc = imageRepresent.Fallback;
  const { handleImageError, isImageErrored } = useImageErrorHandler();
  // Panigation
  const [currentPage, setCurrentPage] = useState(1);
  const specsToShow = ['color', 'ram', 'cpu', 'lcd', 'gpu'];

  useEffect(() => {
    scrollToTopSmoothly();
    if (products.length >= 0) {
      setLoading(false);
    }
  }, [products]);

  const itemsPerPage = 24;
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div>
      <HeaderResponsive Title_NavbarMobile={'7teck.vn'} />
      <div className="py-[60px] xl:pt-0">
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
        {/*  */}
        <div className="space-y-10 px-2 xl:px-desktop-padding">
          <div className="mt-5 w-full">
            <div className="grid w-full grid-flow-row grid-cols-2 items-start gap-[10px] md:grid-cols-4 xl:grid-cols-6">
              {loading ? (
                <ProductPlaceholders count={12} />
              ) : currentProducts.length === 0 ? (
                <div className="col-span-full flex w-full items-center justify-center py-10">
                  <div className="max-w-3xl rounded-xl border border-gray-100 bg-white px-6 py-8 text-center shadow-lg">
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
                  // Navigate
                  const productUrl = slugify(product.name);
                  const subUrl = product?._id;
                  // handleImageError
                  const isErrored = isImageErrored(product._id);
                  const src = isErrored || !product.img ? fallbackSrc : product?.img;
                  return (
                    <section
                      key={product?._id}
                      className="group relative flex h-full w-full flex-col justify-between rounded-md border border-white text-black"
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
                            onError={() => handleImageError(product._id)}
                          />
                        </div>
                      </Link>
                      {/*  */}
                      <div className="flex h-full w-full flex-col items-start justify-between p-1">
                        <Link href={`${basePath}/${productUrl}/${subUrl}`} className="w-full cursor-pointer">
                          <p className="text-prod-name-mobile xl:text-prod-name-desktop font-medium xl:group-hover:text-secondary">
                            {title} {product.name}
                          </p>
                        </Link>

                        <div className="mt-1 w-full">
                          <div className="text-prod-name-mobile xl:text-prod-name-desktop">
                            {specsToShow.map((field) => {
                              const value = product[field as keyof ProductBase];
                              if (!value) return null;

                              const fieldLabelMap: Record<string, string> = {
                                color: 'Màu sắc',
                                ram: 'RAM',
                                cpu: 'CPU',
                                lcd: 'Màn hình',
                                gpu: 'GPU',
                              };

                              return (
                                <p key={field}>
                                  <span className="font-semibold">{fieldLabelMap[field]}: </span>
                                  {value}
                                </p>
                              );
                            })}
                          </div>
                          <p className="text-prod-price-mobile xl:text-prod-price-desktop w-full">
                            <span className="font-semibold text-price">{formatCurrency(product?.price)}</span> &nbsp;
                            {product?.sale && <del className="text-xs font-light text-gray-500">{formatCurrency(product?.sale)}</del>}
                          </p>
                          <Button
                            size="xs"
                            className="w-full rounded-md border-none bg-primary bg-opacity-10 text-primary hover:bg-primary hover:bg-opacity-20"
                            onClick={() => {
                              const productToBuy = {
                                _id: product?._id,
                                name: product?.name,
                                img: product?.img,
                                price: product?.price,
                                ram: product?.ram,
                                color: product?.color,
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
                      {product?.status && (
                        <div className="absolute -left-[3px] top-0 z-20">
                          <Image height={100} width={60} alt="" loading="lazy" className="h-full w-[60px]" src={imageRepresent.Status} />
                          <p className="absolute top-[1px] w-full pl-1 text-xs text-white">{product?.status}</p>
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
