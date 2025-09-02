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
import { FaRegEye } from 'react-icons/fa';
import imageRepresent from '../../../../public/image-represent';
import Image from 'next/image';
import { formatCurrency } from '@/utils/formatCurrency';

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

export default function ClientUsedProductByCatalogPage({ products, title, basePath }: ProductPageProps) {
  const [loading, setLoading] = useState(true);
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
                  return (
                    <section
                      key={product._id}
                      className="group relative flex h-full flex-col justify-between rounded-md border border-primary-lighter text-black"
                    >
                      <Link href={url} className="flex h-full w-full items-center justify-center rounded-md rounded-b-none bg-white">
                        <div className="h-[200px] w-full cursor-pointer overflow-hidden rounded-md rounded-b-none bg-white">
                          <Image
                            height={200}
                            width={200}
                            alt="Hình ảnh"
                            loading="lazy"
                            className="h-full w-full rounded-[5px] rounded-b-none object-contain transition-transform duration-1000 ease-in-out hover:scale-110"
                            src={product?.img}
                          />
                        </div>
                      </Link>
                      {/* Product Info */}
                      <div className="flex h-full w-full flex-col items-start justify-between p-1">
                        <Link href={url} className="w-full cursor-pointer">
                          <div className="flex w-[50px] items-center justify-start gap-1 rounded-sm p-[2px] text-center text-[12px] text-black">
                            <FaRegEye />
                            <p>{product.view}</p>
                          </div>
                          <p className="text-prod-name-mobile font-medium xl:text-prod-name-desktop xl:group-hover:text-primary">
                            {title} {product.name}
                          </p>
                        </Link>
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
                        {/* Price and Buy Now Button */}
                        <div className="w-full">
                          <p className="w-full text-prod-price-mobile xl:text-prod-price-desktop">
                            <span className="font-semibold text-price">{formatCurrency(product?.price)}</span> &nbsp;
                            {product?.sale && <del className="text-xs font-light text-gray-500">{formatCurrency(product?.sale)}</del>}
                          </p>
                          <p className="text-xs text-gray-500">Hỗ trợ trả góp.</p>
                          <p className="text-xs text-gray-500">Miễn phí ship nội thành HCM.</p>
                          <Button
                            size="xs"
                            className="mt-1 w-full rounded-md border border-primary/20 bg-primary bg-opacity-10 text-primary hover:bg-primary hover:bg-opacity-20"
                            onClick={() => {
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
                            Mua Ngay
                          </Button>
                        </div>
                      </div>
                      {/*  */}
                      {product.status && (
                        <div className="absolute -left-[3px] top-0 z-20">
                          <Image alt="status" loading="lazy" width={60} height={100} className="h-full w-[60px]" src={imageRepresent.Status} />
                          <p className="absolute top-[1px] w-full pl-1 text-xs font-medium text-white">{product.status}</p>
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
