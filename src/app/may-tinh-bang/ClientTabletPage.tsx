'use client';
import HeaderResponsive from '@/components/userPage/HeaderResponsive';
import Pagination from '@/components/userPage/Pagination';
import ProductPlaceholders from '@/components/userPage/ProductPlaceholders';
import { ITablet } from '@/types/type/tablet/tablet';
import { scrollToTopSmoothly } from '@/utils/scrollToTopSmoothly';
import { slugify } from '@/utils/slugify';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Button } from 'react-daisyui';
import imageRepresent from '../../../public/image-represent';
import { formatCurrency } from '@/utils/formatCurrency';

export default function ClientTabletPage({ tablets }: { tablets: ITablet[] }) {
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    scrollToTopSmoothly();
    if (tablets.length === 0) {
      const fetchData = async () => {
        setLoading(true);
      };

      fetchData();
    } else {
      setLoading(false);
    }
  }, [tablets]);

  // Handle Click Tablet To Tablet Detail
  const router = useRouter();
  // Panigation
  const itemsPerPage = 12;

  const totalPages = Math.ceil(tablets.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTablets = tablets.slice(indexOfFirstItem, indexOfLastItem);

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
    <div>
      <HeaderResponsive Title_NavbarMobile="iPad" />
      <div className="py-[60px] xl:pt-0">
        <div className="breadcrumbs px-[10px] py-2 text-sm text-black shadow xl:px-desktop-padding">
          <ul className="font-light">
            <li>
              <Link aria-label="Trang chủ" href="/">
                Trang Chủ
              </Link>
            </li>
            <li>
              <Link aria-label="iPad" href="">
                iPad
              </Link>
            </li>
          </ul>
        </div>
        {/*  */}
        <div className="space-y-10 px-2 xl:px-desktop-padding">
          <div className="mt-5 w-full">
            <div className="grid grid-flow-row grid-cols-2 items-start gap-[10px] md:grid-cols-4 xl:grid-cols-6">
              {loading ? (
                <ProductPlaceholders count={12} />
              ) : (
                currentTablets.map((tablet) => {
                  const tabletUrl = slugify(tablet?.tablet_name);
                  const subUrl = tablet?._id;
                  return (
                    <section
                      key={tablet?._id}
                      className="group relative flex h-full w-full flex-col justify-between rounded-md border border-white text-black"
                    >
                      <div
                        onClick={() => router.push(`/may-tinh-bang/${tabletUrl}/${subUrl}`)}
                        className="relative h-[200px] w-full cursor-pointer overflow-hidden rounded-md rounded-b-none"
                      >
                        <Image
                          height={200}
                          width={200}
                          alt="Hình ảnh"
                          loading="lazy"
                          className="absolute left-0 top-0 z-0 h-full w-full rounded-[5px] rounded-b-none object-cover blur-xl filter"
                          src={tablet?.tablet_img}
                        />
                        <Image
                          height={200}
                          width={200}
                          alt="Hình ảnh"
                          loading="lazy"
                          className="absolute left-0 top-0 z-10 h-full w-full rounded-[5px] rounded-b-none object-contain transition-transform duration-1000 ease-in-out hover:scale-110"
                          src={tablet?.tablet_img}
                        />
                      </div>
                      {/*  */}
                      <div className="flex w-full flex-col items-start justify-between">
                        <div className="w-full cursor-pointer p-1" onClick={() => router.push(`/may-tinh-bang/${tabletUrl}/${subUrl}`)}>
                          <p className="xl:group-hover:text-secondary">Máy tính bảng {tablet?.tablet_name}</p>
                        </div>
                        <div className="w-full p-1">
                          <p className="text-gray-700">
                            &nbsp;
                            <span className="font-semibold text-red-700">{formatCurrency(tablet?.tablet_price)}</span>
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
                      {tablet?.tablet_status && (
                        <div className="absolute -left-[3px] top-0 z-20">
                          <Image height={100} width={60} alt="" loading="lazy" className="h-full w-[60px]" src={imageRepresent.Status} />
                          <p className="absolute top-[1px] w-full pl-1 text-xs text-white">{tablet?.tablet_status}</p>
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
