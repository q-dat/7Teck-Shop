'use client';
import HeaderResponsive from '@/components/userPage/HeaderResponsive';
import ProductPlaceholders from '@/components/userPage/ProductPlaceholders';
import { scrollToTopSmoothly } from '@/utils/scrollToTopSmoothly';
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
    scrollToTopSmoothly();
    if (products.length === 0) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [products]);

  return (
    <div>
      <HeaderResponsive Title_NavbarMobile={title} />
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
                      className="group relative flex h-full flex-col justify-between rounded-md border border-white text-black"
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

                      {/*  */}
                      <div className="flex h-full w-full flex-col items-start justify-between p-1">
                        <Link href={url} className="w-full cursor-pointer">
                          <div className="flex w-[50px] items-center justify-start gap-1 rounded-sm p-[2px] text-center text-[12px] text-black">
                            <FaRegEye />
                            <p>{product.view}</p>
                          </div>
                          <p className="xl:group-hover:text-secondary">
                            {title} {product.name}
                          </p>
                          <div className="space-y-1 text-sm">
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
                        </Link>

                        <div className="w-full">
                          <p className="text-gray-700">
                            &nbsp;
                            <span className="font-semibold text-red-700">{formatCurrency(product?.price)}</span>
                            &nbsp;
                            {product?.sale && <del className="text-xs font-light text-gray-100">{formatCurrency(product?.sale)}</del>}
                          </p>
                          <Link aria-label="Mua ngay" href="/thanh-toan" className="z-50 w-full">
                            <Button
                              size="xs"
                              className="w-full rounded-md border-none bg-primary bg-opacity-10 text-primary hover:bg-primary hover:bg-opacity-20"
                            >
                              Mua Ngay
                            </Button>
                          </Link>
                        </div>
                      </div>
                      {/*  */}
                      {product.status && (
                        <div className="absolute -left-[3px] top-0 z-20">
                          <Image alt="status" loading="lazy" width={60} height={100} className="h-full w-[60px]" src={imageRepresent.Status} />
                          <p className="absolute top-[1px] w-full pl-1 text-xs text-white">{product.status}</p>
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
