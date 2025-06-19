'use client';
import Pagination from '@/components/userPage/Pagination';
import { scrollToTopSmoothly } from '@/utils/scrollToTopSmoothly';
import { slugify } from '@/utils/slugify';
import { ITabletCatalog } from '@/types/type/tablet-catalog/tablet-catalog';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import ProductPlaceholders from '@/components/userPage/ProductPlaceholders';
import { formatCurrency } from '@/utils/formatCurrency';

interface ClientUsedTabletPageProps {
  tabletCatalogs: ITabletCatalog[];
}
export default function ClientUsedTabletPage({ tabletCatalogs }: ClientUsedTabletPageProps) {
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    scrollToTopSmoothly();
    if (tabletCatalogs.length === 0) {
      const fetchData = async () => {
        setLoading(true);
      };

      fetchData();
    } else {
      setLoading(false);
    }
  }, [tabletCatalogs]);

  const router = useRouter();
  // Panigation
  const itemsPerPage = 12;
  const NewiPhoneCatalogs = tabletCatalogs.filter(
    (tabletCatalog) => tabletCatalog?.t_cat_status === 1 && tabletCatalog?.t_cat_tabletCount >= 1 // status = 1 (Cũ) t_cat_tabletCount: số lượng sản phẩm theo danh mục
  );
  const totalPages = Math.ceil(NewiPhoneCatalogs.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTablets = NewiPhoneCatalogs.slice(indexOfFirstItem, indexOfLastItem);

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
      <div className="py-2 text-2xl font-semibold text-black">iPad</div>
      <div className="grid grid-flow-row grid-cols-2 items-start gap-[10px] md:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8">
        {loading ? (
          <ProductPlaceholders count={12} />
        ) : currentTablets.length === 0 ? (
          <>Không có dữ liệu!</>
        ) : (
          currentTablets.map((tabletCatalog) => {
            const tabletCatalogUrl = slugify(tabletCatalog.t_cat_name);
            return (
              <div
                key={tabletCatalog?._id}
                onClick={() => router.push(`/may-tinh-bang/${tabletCatalogUrl}`)}
                className="group flex h-full w-full flex-col justify-between rounded-md border border-white bg-white text-black"
              >
                <div className="relative h-[200px] w-full cursor-pointer overflow-hidden rounded-md rounded-b-none">
                  <Image
                    height={200}
                    width={200}
                    alt="Hình ảnh"
                    loading="lazy"
                    className="absolute left-0 top-0 z-0 h-full w-full rounded-[5px] rounded-b-none object-cover blur-xl filter"
                    src={tabletCatalog?.t_cat_img}
                  />
                  <Image
                    height={200}
                    width={200}
                    alt="Hình ảnh"
                    loading="lazy"
                    className="absolute left-0 top-0 z-10 h-full w-full rounded-[5px] rounded-b-none object-contain transition-transform duration-1000 ease-in-out hover:scale-110"
                    src={tabletCatalog?.t_cat_img}
                  />
                </div>
                {/*  */}
                <div className="flex w-full flex-col items-start justify-between">
                  <div className="w-full cursor-pointer p-1">
                    <p className="w-[75px] rounded-sm bg-gray-100 text-center text-[10px] text-white">
                      {tabletCatalog?.t_cat_tabletCount > 99 ? '99+' : tabletCatalog?.t_cat_tabletCount} {' Sản phẩm'}
                    </p>

                    <p className="xl:group-hover:text-secondary">Máy tính bảng {tabletCatalog.t_cat_name}</p>
                  </div>
                  <div className="w-full p-1">
                    <p className="text-gray-700">
                      Từ:&nbsp;
                      <span className="font-semibold text-red-700">{formatCurrency(tabletCatalog.t_cat_price)}</span>
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
