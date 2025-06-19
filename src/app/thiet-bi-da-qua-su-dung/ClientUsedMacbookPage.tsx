'use client';
import Pagination from '@/components/userPage/Pagination';
import { scrollToTopSmoothly } from '@/utils/scrollToTopSmoothly';
import { slugify } from '@/utils/slugify';
import { IMacbookCatalog } from '@/types/type/macbook-catalog/macbook-catalog';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import ProductPlaceholders from '@/components/userPage/ProductPlaceholders';
import { formatCurrency } from '@/utils/formatCurrency';

interface ClientUsedMacbookPageProps {
  macbookCatalogs: IMacbookCatalog[];
}
export default function ClientUsedMacbookPage({ macbookCatalogs }: ClientUsedMacbookPageProps) {
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    scrollToTopSmoothly();
    if (macbookCatalogs.length === 0) {
      const fetchData = async () => {
        setLoading(true);
      };

      fetchData();
    } else {
      setLoading(false);
    }
  }, [macbookCatalogs]);

  const router = useRouter();
  // Panigation
  const itemsPerPage = 12;
  const NewiPhoneCatalogs = macbookCatalogs.filter(
    (macbookCatalog) => macbookCatalog?.m_cat_status === 1 && macbookCatalog?.m_cat_macbookCount >= 1 // status = 1 (Cũ) m_cat_macbookCount số lượng sản phẩm theo danh mục
  );
  const totalPages = Math.ceil(NewiPhoneCatalogs.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMacbook = NewiPhoneCatalogs.slice(indexOfFirstItem, indexOfLastItem);

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
      <div className="py-2 text-2xl font-semibold text-black">Macbook</div>
      <div className="grid grid-flow-row grid-cols-2 items-start gap-[10px] md:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8">
        {loading ? (
          <ProductPlaceholders count={12} />
        ) : currentMacbook.length === 0 ? (
          <>Không có dữ liệu!</>
        ) : (
          currentMacbook.map((macbookCatalog) => {
            const macbookCatalogUrl = slugify(macbookCatalog.m_cat_name);
            return (
              <div
                key={macbookCatalog?._id}
                onClick={() => router.push(`/macbook/${macbookCatalogUrl}`)}
                className="group flex h-full w-full flex-col justify-between rounded-md border border-white bg-white text-black"
              >
                <div className="relative h-[200px] w-full cursor-pointer overflow-hidden rounded-md rounded-b-none">
                  <Image
                    height={200}
                    width={200}
                    alt="Hình ảnh"
                    loading="lazy"
                    className="absolute left-0 top-0 z-0 h-full w-full rounded-[5px] rounded-b-none object-cover blur-xl filter"
                    src={macbookCatalog?.m_cat_img}
                  />
                  <Image
                    height={200}
                    width={200}
                    alt="Hình ảnh"
                    loading="lazy"
                    className="absolute left-0 top-0 z-10 h-full w-full rounded-[5px] rounded-b-none object-contain transition-transform duration-1000 ease-in-out hover:scale-110"
                    src={macbookCatalog?.m_cat_img}
                  />
                </div>
                {/*  */}
                <div className="flex w-full flex-col items-start justify-between">
                  <div className="w-full cursor-pointer p-1">
                    <p className="w-[75px] rounded-sm bg-gray-100 text-center text-[10px] text-white">
                      {macbookCatalog?.m_cat_macbookCount > 99 ? '99+' : macbookCatalog?.m_cat_macbookCount} {' Sản phẩm'}
                    </p>

                    <p className="xl:group-hover:text-secondary">Laptop {macbookCatalog.m_cat_name}</p>
                  </div>
                  <div className="w-full p-1">
                    <p className="text-gray-700">
                      Từ:&nbsp;
                      <span className="font-semibold text-red-700">{formatCurrency(macbookCatalog.m_cat_price)}</span>
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
