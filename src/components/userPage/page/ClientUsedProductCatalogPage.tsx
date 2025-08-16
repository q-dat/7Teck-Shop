// TRANG DANH MỤC THIẾT BỊ ĐÃ QUA SỬ DỤNG
'use client';
import Pagination from '@/components/userPage/Pagination';
import { scrollToTopInstantly } from '@/utils/scrollToTop';
import { slugify } from '@/utils/slugify';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import ProductPlaceholders from '@/components/userPage/ProductPlaceholders';
import { formatCurrency } from '@/utils/formatCurrency';
import Link from 'next/link';
import { contact, hotlineUrl } from '@/utils/socialLinks';

export interface UsedProductCatalog {
  _id: string;
  name: string;
  img: string;
  price: number;
  productCount: number;
  status: number;
}

interface ClientUsedProductCatalogPageProps {
  data: UsedProductCatalog[];
  title: string;
  basePath: string;
  namePrefix: string;
}

export default function ClientUsedProductCatalogPage({ data, title, namePrefix, basePath }: ClientUsedProductCatalogPageProps) {
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    scrollToTopInstantly();
    setLoading(false);
  }, [data]);

  const itemsPerPage = 12;
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const currentItems = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleNextPage = () => currentPage < totalPages && setCurrentPage((p) => p + 1);
  const handlePrevPage = () => currentPage > 1 && setCurrentPage((p) => p - 1);

  return (
    <div className="my-5 rounded-md bg-white p-2">
      <h1 className="bg-white/50 text-start text-xl font-bold uppercase text-primary backdrop-blur-md md:text-2xl xl:text-3xl">{title}</h1>
      <p className="flex w-full flex-col items-start gap-1 rounded-md bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-2 text-xs text-gray-700 xl:flex-row xl:gap-3">
        <span className="font-medium">Hàng chuẩn, giá mềm - An tâm mua sắm.</span>
        <Link href={hotlineUrl}>
          <span className="rounded-xl bg-primary px-2 py-[2px] text-white xl:py-1">Gọi/Zalo: {contact}</span>
        </Link>
      </p>

      <hr />
      <div className="grid grid-flow-row grid-cols-2 items-start gap-[10px] py-2 md:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8">
        {loading ? (
          <ProductPlaceholders count={12} />
        ) : currentItems.length === 0 ? (
          <p className="col-span-full text-red-500">
            <i>Hiện chưa có sản phẩm nào trong mục này!</i>
          </p>
        ) : (
          currentItems.map((product) => {
            const slug = slugify(product.name);
            return (
              <div
                key={product?._id}
                className="group flex h-full w-full flex-col justify-between rounded-md border border-primary-lighter bg-white text-black"
              >
                <div className="w-full">
                  <div className="h-[200px] w-full cursor-pointer overflow-hidden rounded-md rounded-b-none bg-white">
                    <Link href={`/${basePath}/${slug}`}>
                      <Image
                        height={200}
                        width={200}
                        alt="Hình ảnh"
                        loading="lazy"
                        className="h-full w-full rounded-[5px] rounded-b-none object-contain transition-transform duration-1000 ease-in-out hover:scale-110"
                        src={product?.img}
                      />
                    </Link>
                  </div>
                  <div className="w-full cursor-pointer p-1">
                    <p className="w-[75px] rounded-sm bg-gray-100 text-center text-[10px] text-white">
                      {product?.productCount > 99 ? '99+' : product?.productCount} {' Sản phẩm'}
                    </p>
                    <Link href={`/${basePath}/${slug}`}>
                      <p className="text-prod-name-mobile font-medium xl:text-prod-name-desktop xl:group-hover:text-primary">
                        {namePrefix} {product.name}
                      </p>
                    </Link>
                  </div>
                </div>
                {/*  */}
                <div className="flex w-full flex-col items-start justify-between gap-1 p-1">
                  <p className="text-prod-price-mobile text-gray-700 xl:text-prod-price-desktop">
                    Từ:&nbsp;
                    <span className="font-semibold text-price">{formatCurrency(product.price)}</span>
                  </p>
                  <p className="text-xs text-gray-500">Hỗ trợ trả góp.</p>
                  <p className="text-xs text-gray-500">Miễn phí ship nội thành HCM.</p>
                </div>
              </div>
            );
          })
        )}
      </div>
      {/* Pagination Controls */}
      <Pagination currentPage={currentPage} totalPages={totalPages} onNextPage={handleNextPage} onPrevPage={handlePrevPage} />
    </div>
  );
}
