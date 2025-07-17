'use client';
import { useScroll } from '@/hooks/useScroll';
import { slugify } from '@/utils/slugify';
import Link from 'next/link';
import React from 'react';
import { Button } from 'react-daisyui';
import { FaRegEye } from 'react-icons/fa';
import { IoIosArrowForward } from 'react-icons/io';
import { MdArrowBackIosNew, MdArrowForwardIos } from 'react-icons/md';
import imageRepresent from '../../public/image-represent';
import ProductPlaceholders from '@/components/userPage/ProductPlaceholders';
import Image from 'next/image';
import { formatCurrency } from '@/utils/formatCurrency';
import { IPhone } from '@/types/type/products/phone/phone';
import { useImageErrorHandler } from '@/hooks/useImageErrorHandler';

interface ClientPhoneProps {
  mostViewedPhones: IPhone[];
  loading: boolean;
}

export default function ClientPhoneFC({ mostViewedPhones, loading }: ClientPhoneProps) {
  const basePath = 'dien-thoai';
  const { scrollRef, isLeftVisible, isRightVisible, hasOverflow, scrollBy } = useScroll();
  //  handleImageError
  const fallbackSrc = imageRepresent.Fallback;
  const { handleImageError, isImageErrored } = useImageErrorHandler();
  return (
    <div className="mt-10 p-0 xl:px-desktop-padding">
      {/* Title */}
      <div role="region" aria-label="Danh sách sản phẩm nổi bật" className="flex w-full flex-col items-start justify-center px-2 xl:rounded-t-lg">
        <h1 className="py-2 text-2xl font-semibold">{loading ? 'Đang tải...' : mostViewedPhones.length > 0 ? 'Sản phẩm nổi bật' : ''}</h1>
      </div>

      {/* Product List */}
      <div className="relative">
        <section
          ref={scrollRef}
          className="grid w-full grid-flow-col grid-rows-1 items-center justify-start gap-[10px] overflow-x-auto scroll-smooth rounded-none border-[10px] border-transparent bg-white pt-0 scrollbar-hide xl:rounded-t-lg xl:pt-0"
        >
          {loading ? (
            <ProductPlaceholders count={12} />
          ) : (
            mostViewedPhones.map((phone) => {
              const phoneUrl = slugify(phone?.name);
              const isErrored = isImageErrored(phone?._id);
              const src = isErrored || !phone?.img ? fallbackSrc : phone?.img;

              return (
                <div
                  key={phone?._id}
                  className="group relative flex h-full w-[185px] flex-col justify-between rounded-md border border-[#f2f4f7] text-black xl:w-[195px]"
                >
                  <Link aria-label="Xem chi tiết sản phẩm khi ấn vào hình ảnh" href={`/dien-thoai/${phoneUrl}/${phone?._id}`}>
                    <div className="h-[200px] w-full cursor-pointer overflow-hidden rounded-md rounded-b-none bg-white">
                      <Image
                        height={200}
                        width={200}
                        alt="Hình ảnh"
                        loading="lazy"
                        className="h-full w-full rounded-[5px] rounded-b-none object-contain transition-transform duration-1000 ease-in-out hover:scale-110"
                        src={src}
                        onError={() => handleImageError(phone?._id)}
                      />
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="flex h-full w-full flex-col items-start justify-between p-1">
                    <Link
                      aria-label="Xem chi tiết sản phẩm khi nhấn vào tên sản phẩm"
                      className="w-full cursor-pointer"
                      href={`/dien-thoai/${phoneUrl}/${phone?._id}`}
                    >
                      <div className="flex w-[50px] items-center justify-start gap-1 rounded-sm p-[2px] text-center text-[12px] text-black">
                        <FaRegEye />
                        <p>{phone?.view}</p>
                      </div>
                      <p className="text-prod-name-mobile xl:text-prod-name-desktop font-medium xl:group-hover:text-secondary">
                        Điện Thoại {phone?.name}
                      </p>
                    </Link>

                    <div className="mt-1 w-full">
                      <div className="text-prod-name-mobile xl:text-prod-name-desktop">
                        {[
                          { label: 'Màu sắc', value: phone?.color },
                          { label: 'Ram', value: phone?.phone_catalog_id?.configuration_and_memory?.ram },
                        ]
                          .filter((item) => item.value?.toString().trim())
                          .map((item, index) => (
                            <p key={index}>
                              <span className="font-semibold">{item.label}: </span>
                              {item.value}
                            </p>
                          ))}
                      </div>
                      <p className="text-prod-price-mobile xl:text-prod-price-desktop w-full">
                        <span className="font-semibold text-price">{formatCurrency(phone?.price)}</span> &nbsp;
                        {phone?.sale && <del className="text-xs font-light text-gray-500">{formatCurrency(phone?.sale)}</del>}
                      </p>
                      <Button
                        size="xs"
                        className="w-full rounded-md border-none bg-primary bg-opacity-10 text-primary hover:bg-primary hover:bg-opacity-20"
                        onClick={() => {
                          const productToBuy = {
                            _id: phone?._id,
                            name: phone?.name,
                            img: phone?.img,
                            price: phone?.price,
                            ram: phone?.phone_catalog_id?.configuration_and_memory?.ram,
                            color: phone?.color,
                            link: `${basePath}/${slugify(phone?.name)}/${phone?._id}`,
                          };
                          localStorage.setItem('selectedProduct', JSON.stringify(productToBuy));
                          window.location.href = '/thanh-toan';
                        }}
                      >
                        Mua Ngay
                      </Button>
                    </div>
                  </div>

                  {/* Status Tag */}
                  {phone?.status && (
                    <div className="absolute -left-[3px] top-0 z-20">
                      <Image height={100} width={60} alt="" loading="lazy" className="h-full w-[60px]" src={imageRepresent.Status} />
                      <p className="absolute top-[1px] w-full pl-2 text-xs text-white">{phone?.status}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </section>

        {/* Navigation Button */}
        {!loading && mostViewedPhones.length > 0 && (hasOverflow || mostViewedPhones.length > 12) && (
          <div className="absolute top-1/2 flex w-full items-center justify-between">
            <div className="relative w-full">
              <button
                aria-label="Cuộn sang trái"
                onClick={() => scrollBy(-390)}
                className={`absolute left-0 z-[100] -translate-y-1/2 rounded-full border border-gray-400 bg-white p-2 text-black shadow transition-transform duration-200 hover:scale-110 ${
                  isLeftVisible ? '' : 'hidden'
                }`}
              >
                <MdArrowBackIosNew className="text-2xl" />
              </button>
              <button
                aria-label="Cuộn sang phải"
                onClick={() => scrollBy(390)}
                className={`absolute right-0 z-[100] -translate-y-1/2 rounded-full border border-gray-400 bg-white p-2 text-black shadow transition-transform duration-200 hover:scale-110 ${
                  isRightVisible ? '' : 'hidden'
                }`}
              >
                <MdArrowForwardIos className="text-2xl" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* See more */}
      {!loading && mostViewedPhones.length > 0 && (
        <Link href="/dien-thoai" aria-label="Xem thêm sản phẩm điện thoại">
          <button className="flex w-full cursor-pointer items-center justify-center bg-gradient-to-r from-white via-secondary to-white py-1 text-sm text-white xl:rounded-b-lg">
            Xem Thêm Điện Thoại
            <IoIosArrowForward className="text-xl" />
          </button>
        </Link>
      )}
    </div>
  );
}
