'use client';
import Pagination from '@/components/userPage/Pagination';
import { scrollToTopSmoothly } from '@/utils/scrollToTopSmoothly';
import { slugify } from '@/utils/slugify';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import ProductPlaceholders from '@/components/userPage/ProductPlaceholders';
import { formatCurrency } from '@/utils/formatCurrency';
import Link from 'next/link';

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
    scrollToTopSmoothly();
    if (data.length === 0) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [data]);

  const itemsPerPage = 12;
  const filteredData = data.filter((item) => item?.status === 1 && item?.productCount >= 1);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleNextPage = () => currentPage < totalPages && setCurrentPage((p) => p + 1);
  const handlePrevPage = () => currentPage > 1 && setCurrentPage((p) => p - 1);

  return (
    <div className="my-5 rounded-md bg-white p-2">
      <div className="py-2 text-2xl font-semibold text-black">{title}</div>
      <div className="grid grid-flow-row grid-cols-2 items-start gap-[10px] md:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8">
        {loading ? (
          <ProductPlaceholders count={12} />
        ) : currentItems.length === 0 ? (
          <>Không có dữ liệu!</>
        ) : (
          currentItems.map((product) => {
            const slug = slugify(product.name);
            return (
              <div
                key={product?._id}
                className="group flex h-full w-full flex-col justify-between rounded-md border border-white bg-white text-black"
              >
                <div className="h-[200px] w-full cursor-pointer overflow-hidden rounded-md rounded-b-none bg-white">
                  <Link href={`/${basePath}/${slug}`}>
                    <Image
                      height={200}
                      width={200}
                      alt="Hình ảnh"
                      loading="lazy"
                      className="h-full w-full rounded-[5px] rounded-b-none object-cover transition-transform duration-1000 ease-in-out hover:scale-110"
                      src={product?.img}
                    />
                  </Link>
                </div>
                {/*  */}
                <div className="flex w-full flex-col items-start justify-between">
                  <div className="w-full cursor-pointer p-1">
                    <p className="w-[75px] rounded-sm bg-gray-100 text-center text-[10px] text-white">
                      {product?.productCount > 99 ? '99+' : product?.productCount} {' Sản phẩm'}
                    </p>
                    <Link href={`/${basePath}/${slug}`}>
                      <p className="xl:group-hover:text-secondary">
                        {namePrefix} {product.name}
                      </p>
                    </Link>
                  </div>
                  <div className="w-full p-1">
                    <p className="text-gray-700">
                      Từ:&nbsp;
                      <span className="font-semibold text-red-700">{formatCurrency(product.price)}</span>
                    </p>
                  </div>
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
