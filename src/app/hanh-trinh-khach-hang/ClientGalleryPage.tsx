'use client';
import ErrorLoading from '@/components/orther/error/ErrorLoading';
import HeaderResponsive from '@/components/userPage/ui/HeaderResponsive';
import Pagination from '@/components/userPage/Pagination';
import Zoom from '@/lib/Zoom';
import { IGallery } from '@/types/type/gallery/gallery';
import { scrollToTopInstantly } from '@/utils/scrollToTop';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import Masonry from 'react-masonry-css';

export default function ClientGalleryPage({ galleries }: { galleries: IGallery[] }) {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    scrollToTopInstantly();
  }, []);

  // Panigation
  const itemsPerPage = 24;

  const totalPages = Math.ceil(galleries.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentGallerys = galleries.slice(indexOfFirstItem, indexOfLastItem);

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
  if (galleries.length === 0) return <ErrorLoading />;
  return (
    <div>
      <HeaderResponsive Title_NavbarMobile="7teck.vn" />
      <div className="py-[60px] xl:pt-0">
        <div className="breadcrumbs px-[10px] py-2 text-sm text-black shadow dark:text-white xl:px-desktop-padding">
          <ul className="font-light">
            <li>
              <Link aria-label="Trang chủ" href="/">
                Trang Chủ
              </Link>
            </li>
            <li>
              <Link aria-label="Hành trình cùng khách hàng" href="">
                Hành Trình Cùng Khách Hàng
              </Link>
            </li>
          </ul>
        </div>
        {/*  */}

        <div className="mt-5 px-2 xl:px-desktop-padding">
          <Masonry
            breakpointCols={{
              default: 6,
              1280: 6,
              1024: 4,
              768: 3,
              640: 2,
            }}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
          >
            {currentGallerys.map((gallery, index) => (
              <Zoom key={index + 1}>
                <div className="mb-2 overflow-hidden rounded-md">
                  <Image
                    height={300}
                    width={300}
                    src={`${gallery.gallery}`}
                    alt="Hình ảnh khách hàng"
                    className="h-full w-full rounded-md border border-dashed border-black object-contain transition-transform duration-300 hover:scale-105"
                  />
                </div>
              </Zoom>
            ))}
          </Masonry>
        </div>
        {/* Pagination Controls */}
        <Pagination currentPage={currentPage} totalPages={totalPages} onNextPage={handleNextPage} onPrevPage={handlePrevPage} />
      </div>
    </div>
  );
}
