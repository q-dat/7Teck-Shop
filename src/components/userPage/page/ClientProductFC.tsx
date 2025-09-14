'use client';
import { useScroll } from '@/hooks/useScroll';
import { slugify } from '@/utils/slugify';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Button } from 'react-daisyui';
import { MdArrowBackIosNew, MdArrowForwardIos } from 'react-icons/md';
import { IoIosArrowForward } from 'react-icons/io';
import imageRepresent from '../../../../public/image-represent';
import ProductPlaceholders from '@/components/userPage/ProductPlaceholders';
import Image from 'next/image';
import { formatCurrency } from '@/utils/formatCurrency';

export interface Product {
  _id: string;
  name: string;
  price: number;
  sale: number | null;
  image: string;
  status?: string;
  color: string;
  ram: string;
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
        setInternalLoading(true);
      } else {
        setInternalLoading(false);
      }
    }
  }, [products, externalLoading]);

  // Lọc các sản phẩm có sale
  const sortedProducts = products.filter((product) => product.sale);

  //  placeholder
  if (loading) {
    return (
      <div className="p-0 xl:px-desktop-padding">
        <h1 className="py-2 text-2xl font-semibold">Đang tải...</h1>
        <div className="grid w-full grid-flow-col grid-rows-1 gap-[10px] overflow-x-auto scroll-smooth border-[10px] border-transparent bg-white scrollbar-hide xl:rounded-t-lg">
          <ProductPlaceholders count={12} />
        </div>
      </div>
    );
  }

  if (sortedProducts.length === 0) {
    return null;
  }

  return (
    <div className="mb-10 p-0 xl:px-desktop-padding">
      {/* Tiêu đề */}
      <div
        role="region"
        aria-label={`Danh sách giảm giá mạnh ${category.name}`}
        className="flex w-full flex-col items-start justify-center px-2 xl:rounded-t-lg"
      >
        <h1 className="pb-2 text-2xl font-semibold">{category.title}</h1>
      </div>

      {/* Phần sản phẩm */}
      <div className="relative">
        <section ref={scrollRef} className="w-full">
          <div className="grid w-full grid-flow-col grid-rows-1 items-center justify-start gap-[10px] overflow-x-auto scroll-smooth border-[10px] border-transparent bg-white scrollbar-hide xl:rounded-t-lg">
            {sortedProducts.map((product) => {
              const productUrl = slugify(product.name);
              return (
                <div
                  key={product._id}
                  className="group relative flex h-full w-[185px] flex-col justify-between rounded-md border border-primary-lighter text-black xl:w-[195px]"
                >
                  <Link aria-label="Xem chi tiết sản phẩm khi ấn vào hình ảnh" href={`${category.url}/${productUrl}/${product._id}`}>
                    <div className="h-[200px] w-full cursor-pointer overflow-hidden">
                      <Image
                        height={200}
                        width={200}
                        alt="Hình ảnh"
                        loading="lazy"
                        className="h-full w-full rounded-[5px] rounded-b-none object-contain transition-transform duration-1000 ease-in-out group-hover:scale-110"
                        src={product.image}
                      />
                    </div>
                  </Link>
                  {/* Product Info */}
                  <div className="flex h-full w-full flex-col items-start justify-between p-1">
                    <div className="w-full">
                      <Link
                        aria-label="Xem chi tiết sản phẩm khi nhấn vào tên sản phẩm"
                        className="w-full cursor-pointer"
                        href={`${category.url}/${productUrl}/${product._id}`}
                      >
                        <p className="text-prod-name-mobile font-medium xl:text-prod-name-desktop xl:group-hover:text-secondary">
                          <span>{category.name}</span>&nbsp;<span>{product.name}</span>
                        </p>
                      </Link>
                      {/* Product Specifications */}
                      <div className="py-1 text-prod-name-mobile xl:text-prod-name-desktop">
                        {[
                          { label: 'Màu', value: product?.color },
                          { label: 'RAM', value: product?.ram },
                        ]
                          .filter((item) => item.value?.toString().trim())
                          .map((item, index) => (
                            <p key={index}>
                              <span className="rounded-sm bg-primary-lighter px-1 font-semibold">{item.label}:</span>
                              &nbsp;<span className="font-light">{item.value}</span>
                            </p>
                          ))}
                      </div>
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
                            img: product?.image,
                            price: product?.price,
                            ram: product?.ram,
                            color: product?.color,
                            link: `${category.url}/${productUrl}/${product._id}`,
                          };
                          localStorage.setItem('selectedProduct', JSON.stringify(productToBuy));
                          window.location.href = '/thanh-toan';
                        }}
                      >
                        Mua Ngay
                      </Button>
                    </div>
                  </div>

                  {product.status && (
                    <div className="absolute -left-[3px] top-0 z-20">
                      <Image height={100} width={60} alt="" loading="lazy" className="h-full w-[60px]" src={imageRepresent.Status} />
                      <p className="absolute top-[1px] w-full pl-2 text-xs font-medium text-white">{product.status}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Nút điều hướng */}
        <div className="absolute top-1/2 flex w-full items-center justify-between">
          <div className="relative w-full">
            {isLeftVisible && (
              <button
                aria-label="Cuộn sang trái"
                onClick={() => scrollBy(-390)}
                className="absolute left-0 z-[100] -translate-y-1/2 rounded-full border border-gray-400 bg-white p-2 shadow hover:scale-110"
              >
                <MdArrowBackIosNew className="text-2xl" />
              </button>
            )}
            {isRightVisible && (
              <button
                aria-label="Cuộn sang phải"
                onClick={() => scrollBy(390)}
                className="absolute right-0 z-[100] -translate-y-1/2 rounded-full border border-gray-400 bg-white p-2 shadow hover:scale-110"
              >
                <MdArrowForwardIos className="text-2xl" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Link xem thêm */}
      <Link href={category.url} aria-label={category.ariaLabel}>
        <button className="flex w-full cursor-pointer items-center justify-center bg-gradient-to-r from-white via-secondary to-white py-1 text-sm text-white xl:rounded-b-lg">
          Xem Thêm {category.name}
          <IoIosArrowForward className="text-xl" />
        </button>
      </Link>
    </div>
  );
}
