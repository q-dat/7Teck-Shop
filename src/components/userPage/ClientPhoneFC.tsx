'use client';
import { useScroll } from '@/hooks/useScroll';
import { slugify } from '@/utils/slugify';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Button } from 'react-daisyui';
import { FaRegEye } from 'react-icons/fa';
import { IoIosArrowForward } from 'react-icons/io';
import { MdArrowBackIosNew, MdArrowForwardIos } from 'react-icons/md';
import imageRepresent from '../../../public/image-represent';
import ProductPlaceholders from '@/components/userPage/ProductPlaceholders';
import Image from 'next/image';
import { formatCurrency } from '@/utils/formatCurrency';
import { IPhone } from '@/types/type/products/phone/phone';
import { useImageErrorHandler } from '@/hooks/useImageErrorHandler';
import { images } from '../../../public/images';
import Tilt from 'react-parallax-tilt';

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

  //  handle tilt effect
  const [tiltX, setTiltX] = useState(0);
  const [tiltY, setTiltY] = useState(0);
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const maxAngle = 15; // góc nghiêng tối đa

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      const tiltY = (deltaX / centerX) * maxAngle; // trục Y -> trái/phải
      const tiltX = -(deltaY / centerY) * maxAngle; // trục X -> lên/xuống

      setTiltX(tiltX);
      setTiltY(tiltY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="mt-10 block p-0 xl:hidden xl:px-desktop-padding">
      {/* Title */}
      <div role="region" aria-label="Danh sách sản phẩm nổi bật" className="flex w-full flex-col items-start justify-center px-2 xl:rounded-t-lg">
        <h1 className="py-2 text-2xl font-semibold">{loading ? 'Đang tải...' : mostViewedPhones.length > 0 ? 'Sản phẩm nổi bật' : ''}</h1>
      </div>

      {/* Product List */}
      <div className="flex h-fit flex-col items-center justify-center xl:flex-row">
        {loading ? (
          <div className="hidden w-full animate-pulse space-y-2 xl:block xl:w-2/3 2xl:w-3/4">
            <div className="h-[200px] w-full rounded-md bg-primary/20" />
            <div className="h-2 w-3/4 bg-primary/20" />
            <div className="h-2 w-full bg-primary/20" />
            <div className="h-2 w-5/6 bg-primary/20" />
          </div>
        ) : (
          <div className="z-50 hidden w-full rounded-none border-2 border-transparent xl:block xl:w-1/3 xl:border-[10px] 2xl:w-1/4">
            <Tilt
              tiltMaxAngleX={100}
              tiltMaxAngleY={100}
              tiltAngleXManual={tiltX}
              tiltAngleYManual={tiltY}
              glareEnable={true}
              glareMaxOpacity={0.1}
              scale={1.05}
              transitionSpeed={600}
            >
              <Link href="/bang-gia-thu-mua">
                <Image
                  src={images.Popup}
                  alt="Banner"
                  width={1000}
                  height={1000}
                  className="h-full w-full cursor-pointer object-contain"
                  placeholder="blur"
                  blurDataURL={images.Popup}
                  onError={() => handleImageError(images.Popup)}
                />
              </Link>
            </Tilt>
          </div>
        )}
        <div className="relative w-full xl:w-2/3 2xl:w-3/4">
          <section
            ref={scrollRef}
            className="grid w-full grid-flow-col grid-rows-1 items-center justify-start gap-[10px] overflow-x-auto scroll-smooth rounded-none border-[10px] border-transparent bg-white pt-0 scrollbar-hide xl:rounded-t-lg"
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
                    className="group relative flex h-full w-[185px] flex-col justify-between rounded-md border border-primary-lighter text-black xl:w-[195px]"
                  >
                    <Link aria-label="Xem chi tiết sản phẩm khi ấn vào hình ảnh" href={`/${phoneUrl}/${phone?._id}`}>
                      <div className="h-[200px] w-full cursor-pointer overflow-hidden rounded-md rounded-b-none bg-white">
                        <Image
                          height={200}
                          width={200}
                          alt="Hình ảnh"
                          loading="lazy"
                          className="h-full w-full rounded-[5px] rounded-b-none object-contain transition-transform duration-1000 ease-in-out group-hover:scale-110"
                          src={src}
                          onError={() => handleImageError(phone?._id)}
                        />
                      </div>
                    </Link>

                    {/* Product Info */}
                    <div className="flex h-full w-full flex-col items-start justify-between p-1">
                      {/* Product Name and View Count */}
                      <div className="w-full">
                        <Link
                          aria-label="Xem chi tiết sản phẩm khi nhấn vào tên sản phẩm"
                          className="w-full cursor-pointer"
                          href={`/${phoneUrl}/${phone?._id}`}
                        >
                          <div className="flex w-[50px] items-center justify-start gap-1 rounded-sm p-[2px] text-center text-[12px] text-black">
                            <FaRegEye />
                            <p>{phone?.view}</p>
                          </div>
                          <p className="text-prod-name-mobile font-medium xl:text-prod-name-desktop xl:group-hover:text-primary">
                            Điện Thoại {phone?.name}
                          </p>
                        </Link>
                        {/* Product Specifications */}
                        <div className="py-1 text-prod-name-mobile xl:text-prod-name-desktop">
                          {[
                            { label: 'Màu', value: phone?.color },
                            { label: 'RAM', value: phone?.phone_catalog_id?.configuration_and_memory?.ram },
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
                      {/* Price and Buy Button */}
                      <div className="w-full">
                        <p className="text-prod-price-mobile xl:text-prod-price-desktop">
                          <span className="font-semibold text-price">{formatCurrency(phone?.price)}</span> &nbsp;
                          {phone?.sale && <del className="text-xs font-light text-gray-500">{formatCurrency(phone?.sale)}</del>}
                        </p>
                        <p className="text-xs text-gray-500">Hỗ trợ trả góp.</p>
                        <p className="text-xs text-gray-500">Miễn phí ship nội thành HCM.</p>
                        <Button
                          className="mt-1 w-full rounded-md border border-primary/20 bg-primary bg-opacity-10 text-primary hover:bg-primary hover:bg-opacity-20"
                          size="xs"
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
                        <p className="absolute top-[1px] w-full pl-2 text-xs font-medium text-white">{phone?.status}</p>
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
      </div>

      {/* See more */}
      {!loading && mostViewedPhones.length > 0 && (
        <Link href="/dien-thoai" aria-label="Xem thêm sản phẩm điện thoại">
          <button className="flex w-full cursor-pointer items-center justify-center bg-gradient-to-r from-white via-secondary to-white py-1 text-sm text-white xl:rounded-b-lg">
            Xem Thêm
            <IoIosArrowForward className="text-xl" />
          </button>
        </Link>
      )}
    </div>
  );
}
