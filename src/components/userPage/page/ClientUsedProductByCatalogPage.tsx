// TRANG THIẾT BỊ ĐÃ QUA SỬ DỤNG
'use client';
import HeaderResponsive from '@/components/userPage/ui/HeaderResponsive';
import ProductPlaceholders from '@/components/userPage/ProductPlaceholders';
import { scrollToTopInstantly } from '@/utils/scrollToTop';
import { slugify } from '@/utils/slugify';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Button } from 'react-daisyui';
import imageRepresent from '../../../../public/image-represent';
import Image from 'next/image';
import { formatCurrency } from '@/utils/formatCurrency';
import { useImageErrorHandler } from '@/hooks/useImageErrorHandler';

export interface ProductBase {
  _id: string;
  name: string;
  img: string;
  price: number;
  sale: number | null;
  status: string | null;
  view: number;
  color: string;
  ram?: string;
  cpu?: string;
  lcd?: string;
  gpu?: string;
}

type ProductPageProps = {
  title: string;
  products: ProductBase[];
  basePath: string;
};
// Danh sách trạng thái hết hàng
const EXCLUDED_STATUSES = ['hết hàng', 'ngừng kinh doanh', 'ngưng bán'];

export default function ClientUsedProductByCatalogPage({ products, title, basePath }: ProductPageProps) {
  const [loading, setLoading] = useState(true);
  // Image error
  const fallbackSrc = imageRepresent.Fallback;
  const { handleImageError, isImageErrored } = useImageErrorHandler();
  const { name } = useParams();
  const specsToShow = ['color', 'ram', 'cpu', 'lcd', 'gpu'];
  const filtered = products.filter((product) => slugify(product.name) === name);

  useEffect(() => {
    scrollToTopInstantly();
    setLoading(false);
  }, [products]);

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
              <Link href="">{title}</Link>
            </li>
          </ul>
        </div>

        <div className="space-y-10 px-2 xl:px-desktop-padding">
          <div className="mt-5 w-full">
            <div className="grid grid-flow-row grid-cols-2 items-start gap-[10px] md:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-7">
              {loading ? (
                <ProductPlaceholders count={12} />
              ) : filtered.length > 0 ? (
                filtered.map((product) => {
                  const slug = slugify(product.name);
                  const url = `/${basePath}/${slug}/${product._id}`;
                  // handleImageError
                  const isErrored = isImageErrored(product._id);
                  const src = isErrored || !product.img ? fallbackSrc : product?.img;
                  const isExcluded = product.status && EXCLUDED_STATUSES.includes(product.status.toLowerCase());

                  return (
                    <section
                      key={product?._id}
                      className="group relative flex h-full w-full flex-col justify-between rounded-md border border-primary-lighter text-black"
                    >
                      <div className="w-full">
                        <Link className="relative" aria-label="Xem chi tiết sản phẩm khi ấn vào hình ảnh" href={url}>
                          {/* Product Image */}
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
                          {/* Product Title & Specifications */}
                          <div className="w-full px-1 pt-1">
                            <p className="text-prod-name-mobile font-medium xl:text-prod-name-desktop xl:group-hover:text-primary">
                              <span>{title}</span>
                              &nbsp;
                              <span>{product.name}</span>
                            </p>
                            {/* Product Specifications */}
                            <div className="py-1 text-prod-name-mobile xl:text-prod-name-desktop">
                              {specsToShow.map((field) => {
                                const value = product[field as keyof ProductBase];
                                if (!value) return null;

                                const fieldLabelMap: Record<string, string> = {
                                  color: 'Màu',
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

                      <div className="w-full px-1 pb-1">
                        {/* Price and Buy Now Button */}
                        <p className="w-full text-prod-price-mobile xl:text-prod-price-desktop">
                          <span className="font-semibold text-price">{formatCurrency(product?.price)}</span> &nbsp;
                          {product?.sale && <del className="text-xs font-light text-gray-500">{formatCurrency(product?.sale)}</del>}
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
                              _id: product?._id,
                              name: product?.name,
                              img: product?.img,
                              price: product?.price,
                              ram: product?.ram,
                              color: product?.color,
                              link: `${basePath}/${slugify(product.name)}/${product._id}`,
                            };
                            localStorage.setItem('selectedProduct', JSON.stringify(productToBuy));
                            window.location.href = '/thanh-toan';
                          }}
                        >
                          {isExcluded ? 'Không khả dụng' : 'Mua Ngay'}
                        </Button>
                      </div>
                      {/*  */}
                      {!isExcluded && product?.status && (
                        <div className="absolute -left-[3px] top-0 z-20">
                          <Image height={100} width={60} alt="" loading="lazy" className="h-full w-[60px]" src={imageRepresent.Status} />
                          <p className="absolute top-[1px] w-full pl-1 text-xs font-medium text-white">{product?.status}</p>
                        </div>
                      )}
                    </section>
                  );
                })
              ) : (
                <div className="col-span-full text-center text-2xl">Rất tiếc. Không tìm thấy sản phẩm nào!</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
