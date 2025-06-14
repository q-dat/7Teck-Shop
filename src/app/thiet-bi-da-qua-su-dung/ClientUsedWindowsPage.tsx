'use client';
import Pagination from '@/components/userPage/Pagination';
import { scrollToTopSmoothly } from '@/utils/scrollToTopSmoothly';
import { slugify } from '@/utils/slugify';
import { IWindowsCatalog } from '@/types/type/windows-catalog/windows-catalog';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface ClientUsedWindowsPageProps {
  windowsCatalogs: IWindowsCatalog[];
}
export default function ClientUsedWindowsPage({ windowsCatalogs }: ClientUsedWindowsPageProps) {
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    scrollToTopSmoothly();
    if (windowsCatalogs.length === 0) {
      const fetchData = async () => {
        setLoading(true);
        setLoading(false);
      };

      fetchData();
    } else {
      setLoading(false);
    }
  }, [windowsCatalogs]);

  const router = useRouter();
  // Panigation
  const itemsPerPage = 12;
  const NewiPhoneCatalogs = windowsCatalogs.filter(
    (windowsCatalog) => windowsCatalog?.w_cat_status === 1 && windowsCatalog?.w_cat_windowsCount >= 1 // status = 1 (Cũ) w_cat_windowsCount số lượng sản phẩm theo danh mục
  );
  const totalPages = Math.ceil(NewiPhoneCatalogs.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentWindows = NewiPhoneCatalogs.slice(indexOfFirstItem, indexOfLastItem);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="my-5 rounded-md bg-white p-2">
      <div className="py-2 text-2xl font-semibold text-black">Windows</div>
      <div className="grid grid-flow-row grid-cols-2 items-start gap-[10px] md:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8">
        {loading ? (
          Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="w-[195px] p-2">
              <div className="animate-pulse space-y-2">
                <div className="h-[200px] w-full rounded-md bg-gray-300" />
                <div className="h-4 w-3/4 rounded bg-gray-300" />
                <div className="h-4 w-full rounded bg-gray-300" />
                <div className="h-4 w-5/6 rounded bg-gray-300" />
              </div>
            </div>
          ))
        ) : currentWindows.length === 0 ? (
          <>Không có dữ liệu!</>
        ) : (
          currentWindows.map((windowsCatalog) => {
            const windowsCatalogUrl = slugify(windowsCatalog.w_cat_name);
            return (
              <div
                key={windowsCatalog?._id}
                onClick={() => router.push(`/windows/${windowsCatalogUrl}`)}
                className="group flex h-full w-full flex-col justify-between rounded-md border border-white bg-white text-black"
              >
                <div className="relative h-[200px] w-full cursor-pointer overflow-hidden rounded-md rounded-b-none">
                  <Image
                    height={100}
                    width={100}
                    alt="Hình ảnh"
                    loading="lazy"
                    className="filter absolute left-0 top-0 z-0 h-full w-full rounded-[5px] rounded-b-none object-cover blur-xl"
                    src={windowsCatalog?.w_cat_img}
                  />
                  <Image
                    height={100}
                    width={100}
                    alt="Hình ảnh"
                    loading="lazy"
                    className="absolute left-0 top-0 z-10 h-full w-full rounded-[5px] rounded-b-none object-contain transition-transform duration-1000 ease-in-out hover:scale-110"
                    src={windowsCatalog?.w_cat_img}
                  />
                </div>
                {/*  */}
                <div className="flex w-full flex-col items-start justify-between">
                  <div className="w-full cursor-pointer p-1">
                    <p className="w-[75px] rounded-sm bg-gray-100 text-center text-[10px] text-white">
                      {windowsCatalog?.w_cat_windowsCount > 99 ? '99+' : windowsCatalog?.w_cat_windowsCount} {' Sản phẩm'}
                    </p>

                    <p className="xl:group-hover:text-secondary">Laptop {windowsCatalog.w_cat_name}</p>
                  </div>
                  <div className="w-full p-1">
                    <p className="text-gray-700">
                      Từ:&nbsp;
                      <span className="font-semibold text-red-700">{(windowsCatalog.w_cat_price * 1000).toLocaleString('vi-VN')}₫</span>
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
