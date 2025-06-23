'use client';
import { useScroll } from '@/hooks/useScroll';
import { slugify } from '@/utils/slugify';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Button } from 'react-daisyui';
import { MdArrowBackIosNew, MdArrowForwardIos } from 'react-icons/md';
import { IoIosArrowForward } from 'react-icons/io';
import imageRepresent from '../../public/image-represent';
import ProductPlaceholders from '@/components/userPage/ProductPlaceholders';
import Image from 'next/image';
import { formatCurrency } from '@/utils/formatCurrency';

export interface Product {
  _id: string;
  name: string; // Tên sản phẩm (thay cho macbook_name, tablet_name, windows_name)
  price: number; // Giá sản phẩm (thay cho macbook_price, tablet_price, windows_price)
  sale: number | null; // Giá khuyến mãi (thay cho macbook_sale, tablet_sale, windows_sale)
  image: string; // URL hình ảnh (thay cho macbook_img, tablet_img, windows_img)
  status?: string; // Trạng thái (thay cho macbook_status, tablet_status, windows_status)
}
interface ClientProductFCProps {
  products: Product[];
  category: {
    name: string; // Ví dụ: "Máy Tính Bảng", "Macbook", "Windows"
    url: string; // Ví dụ: "/may-tinh-bang", "/macbook", "/windows"
    title: string; // Ví dụ: "Máy Tính Bảng - Giảm giá mạnh"
    ariaLabel: string; // Ví dụ: "Xem thêm sản phẩm Máy Tính Bảng"
  };
  loading?: boolean; // Thêm prop loading tùy chọn
}

export default function ClientProductFC({ products, category, loading: externalLoading }: ClientProductFCProps) {
  const { scrollRef, isLeftVisible, isRightVisible, scrollBy } = useScroll();
  const [internalLoading, setInternalLoading] = useState(true);

  // Sử dụng externalLoading nếu được truyền, nếu không dùng internalLoading
  const loading = externalLoading !== undefined ? externalLoading : internalLoading;

  // Kiểm tra trạng thái tải nội bộ nếu không có externalLoading
  useEffect(() => {
    if (externalLoading === undefined) {
      if (products.length === 0) {
        const fetchData = async () => {
          setInternalLoading(true);
        };
        fetchData();
      } else {
        setInternalLoading(false);
      }
    }
  }, [products, externalLoading]);

  // Lọc các sản phẩm có sale
  const sortedProducts = products.filter((product) => product.sale);

  return (
    <div className="p-0 xl:px-desktop-padding">
      {/* Tiêu đề danh mục */}
      <div
        role="region"
        aria-label={`Danh sách giảm giá mạnh ${category.name}`}
        className="flex w-full flex-col items-start justify-center px-2 xl:rounded-t-lg"
      >
        <h1 className="py-2 text-2xl font-semibold">{loading ? <>Đang tải...</> : sortedProducts.length === 0 ? <></> : <>{category.title}</>}</h1>
      </div>
      <div className="relative">
        <section
          ref={scrollRef}
          className="grid w-full grid-flow-col grid-rows-1 items-center justify-start gap-[10px] overflow-x-auto scroll-smooth rounded-none border-[10px] border-transparent bg-white pt-0 scrollbar-hide xl:rounded-t-lg xl:pt-0"
        >
          {loading ? (
            <ProductPlaceholders count={12} />
          ) : sortedProducts.length === 0 ? (
            <></>
          ) : (
            sortedProducts.map((product) => {
              const productUrl = slugify(product.name);
              return (
                <div
                  key={product._id}
                  className="group relative flex h-full w-[195px] flex-col justify-between rounded-md border border-[#f2f4f7] text-black"
                >
                  <Link aria-label="Xem chi tiết sản phẩm khi ấn vào hình ảnh" href={`${category.url}/${productUrl}/${product._id}`}>
                    <div className="relative h-[200px] w-full cursor-pointer overflow-hidden">
                      <Image
                        height={200}
                        width={200}
                        alt="Hình ảnh"
                        loading="lazy"
                        className="absolute left-0 top-0 z-0 h-full w-full rounded-[5px] rounded-b-none object-cover blur-xl filter"
                        src={product.image}
                      />
                      <Image
                        height={200}
                        width={200}
                        alt="Hình ảnh"
                        loading="lazy"
                        className="absolute left-0 top-0 z-10 h-full w-full rounded-[5px] rounded-b-none object-contain transition-transform duration-1000 ease-in-out hover:scale-110"
                        src={product.image}
                      />
                    </div>
                  </Link>

                  <div className="flex h-full w-full flex-col items-start justify-between p-1">
                    <Link
                      aria-label="Xem chi tiết sản phẩm khi nhấn vào tên sản phẩm"
                      className="w-full cursor-pointer"
                      href={`${category.url}/${productUrl}/${product._id}`}
                    >
                      <p className="xl:group-hover:text-secondary">
                        {category.name} {product.name}
                      </p>
                    </Link>
                    <div className="w-full">
                      <p className="text-red-700">
                        {formatCurrency(product.price)}{' '}
                        {product.sale && <del className="text-xs font-light text-gray-500">{formatCurrency(product.sale)}</del>}
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

                  {product.status && (
                    <div className="absolute -left-[3px] top-0 z-20">
                      <Image height={100} width={60} alt="" loading="lazy" className="h-full w-[60px]" src={imageRepresent.Status} />
                      <p className="absolute top-[1px] w-full pl-2 text-xs text-white">{product.status}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </section>

        {/* Nút điều hướng cuộn */}
        <div className="absolute top-1/2 flex w-full items-center justify-between">
          <div className="relative w-full">
            <button
              aria-label="Cuộn sang trái"
              onClick={() => scrollBy(-380)}
              className={`absolute -top-2 left-0 z-[100] rounded-full border-none bg-black bg-opacity-20 text-white ${isLeftVisible ? '' : 'hidden'}`}
            >
              <MdArrowBackIosNew className="text-4xl" />
            </button>
            <button
              aria-label="Cuộn sang phải"
              onClick={() => scrollBy(380)}
              className={`absolute -top-2 right-0 z-[100] rounded-full border-none bg-black bg-opacity-20 text-white ${isRightVisible ? '' : 'hidden'}`}
            >
              <MdArrowForwardIos className="text-4xl" />
            </button>
          </div>
        </div>
      </div>

      {/* Liên kết Xem thêm */}
      <Link href={category.url} aria-label={category.ariaLabel}>
        {loading ? (
          <>Đang tải...</>
        ) : sortedProducts.length === 0 ? (
          <></>
        ) : (
          <button className="flex w-full cursor-pointer items-center justify-center bg-gradient-to-r from-white via-secondary to-white py-1 text-sm text-white xl:rounded-b-lg">
            Xem Thêm Sản Phẩm {category.name}
            <IoIosArrowForward className="text-xl" />
          </button>
        )}
      </Link>
    </div>
  );
}
