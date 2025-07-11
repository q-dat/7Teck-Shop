'use client';
import { LoadingLocal } from '@/components/orther/loading';
import HeaderResponsive from '@/components/userPage/HeaderResponsive';
import Zoom from '@/lib/Zoom';
import { scrollBy, updateScrollButtons, handleScrollButtons, handleThumbnailClick } from '@/utils/DetailPage/scrollUtils';
import { formatCurrency } from '@/utils/formatCurrency';
import { scrollToTopSmoothly } from '@/utils/scrollToTopSmoothly';
import { slugify } from '@/utils/slugify';
import { contact, hotlineUrl } from '@/utils/socialLinks';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Button } from 'react-daisyui';
import { IoIosArrowDropdownCircle } from 'react-icons/io';
import { MdArrowBackIosNew, MdArrowForwardIos } from 'react-icons/md';

export interface ProductCatalogGroup {
  [field: string]: string | number | string[] | null;
}
// Định nghĩa interface sản phẩm chung

interface Product {
  _id: string;
  name: string;
  img: string;
  price: number;
  sale?: number;
  color?: string;
  ram?: string;
  status?: string;
  des?: string;
  thumbnail?: string[];
  catalog: Record<string, ProductCatalogGroup>;
  catalogContent: string;
}

// Định nghĩa interface ánh xạ trường cho thông số kỹ thuật
interface FieldMap {
  group: string;
  name: string;
  fields: { field: string; name: string }[];
}

// Thuộc tính cho component cha
interface ClientProductDetailPageProps {
  product: Product;
  fieldMap: FieldMap[];
  namePrefix: string;
  basePath: string;
}

export default function ClientProductDetailPage({ product, fieldMap, namePrefix, basePath }: ClientProductDetailPageProps) {
  const [selectedImage, setSelectedImage] = useState<string | null | undefined>(null);
  const [activeTab, setActiveTab] = useState<string>('specs');
  const [isLeftButtonVisible, setIsLeftButtonVisible] = useState(true);
  const [isRightButtonVisible, setIsRightButtonVisible] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null!);
  const [loading, setLoading] = useState(true);
  const thumbnails = [product?.img, ...(product?.thumbnail || [])];

  useLayoutEffect(() => {
    if (product && product?.catalog) {
      setLoading(false);
    }
    updateScrollButtons(scrollRef, setIsLeftButtonVisible, setIsRightButtonVisible);
  }, [product, product?.thumbnail]);

  useEffect(() => {
    scrollToTopSmoothly();
    const cleanup = handleScrollButtons(scrollRef, Object.keys(product?.catalog || {}).length, () =>
      updateScrollButtons(scrollRef, setIsLeftButtonVisible, setIsRightButtonVisible)
    );
    return cleanup;
  }, [product]);

  if (loading || !product || !product?.catalog) {
    return <LoadingLocal />;
  }

  return (
    <div>
      <HeaderResponsive Title_NavbarMobile="Thông Tin Sản Phẩm" />
      <div className="py-[60px] xl:pt-0">
        <div className="breadcrumbs px-[10px] py-2 text-sm text-black shadow xl:px-desktop-padding">
          <ul className="font-light">
            <li>
              <Link role="navigation" aria-label="Trang chủ" href="/">
                Trang Chủ
              </Link>
            </li>
            <li>
              <Link role="navigation" aria-label="Thông tin sản phẩm" href="">
                Thông Tin Sản Phẩm
              </Link>
            </li>
          </ul>
        </div>
        <div className="mt-2 px-2 xl:px-[150px]">
          <div className="flex flex-col items-start justify-start gap-5 xl:flex-row">
            {/* IMG */}
            <div className="flex w-full flex-col gap-5">
              <div className="relative w-full">
                <div className="h-[500px] w-full overflow-hidden object-cover">
                  <Zoom>
                    <Image
                      priority
                      width={500}
                      height={500}
                      src={selectedImage || product?.img}
                      alt={product?.name || 'Hình ảnh'}
                      className="absolute left-0 top-0 z-10 h-full w-full rounded-md object-contain"
                    />
                  </Zoom>
                </div>
              </div>
              {/* Thumbnails */}
              <div className="relative rounded-md p-1">
                <div
                  ref={scrollRef}
                  className="flex w-full flex-row items-start justify-start gap-2 overflow-x-auto scroll-smooth scrollbar-hide xl:w-[550px] 2xl:w-full"
                >
                  {product?.thumbnail && Array.isArray(product?.thumbnail) ? (
                    thumbnails.map((thumb: string, index: number) => (
                      <Image
                        width={200}
                        height={200}
                        loading="lazy"
                        key={index}
                        src={thumb}
                        alt="Ảnh thu nhỏ"
                        className={`h-[70px] w-[70px] cursor-pointer rounded-md border object-cover ${
                          selectedImage === thumb ? 'border-2 border-primary' : ''
                        }`}
                        onClick={() => handleThumbnailClick(scrollRef, thumb, index, setSelectedImage)}
                      />
                    ))
                  ) : (
                    <span>Không có ảnh thu nhỏ</span>
                  )}
                </div>
                {/* Navigation Button  */}
                <div role="button" className="absolute left-0 top-4 flex w-full items-center justify-between">
                  <div className="relative w-full">
                    <button
                      aria-label="Cuộn sang trái"
                      onClick={() => scrollBy(scrollRef, -70)}
                      className={`absolute -left-1 z-[100] rounded-full bg-primary p-2 text-white xl:-left-2 ${isLeftButtonVisible ? '' : 'hidden'}`}
                    >
                      <MdArrowBackIosNew className="text-2xl" />
                    </button>
                    <button
                      aria-label="Cuộn sang phải"
                      onClick={() => scrollBy(scrollRef, 70)}
                      className={`absolute -right-1 z-[100] rounded-full bg-primary p-2 text-white xl:-right-2 ${isRightButtonVisible ? '' : 'hidden'}`}
                    >
                      <MdArrowForwardIos className="text-2xl" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* Description */}
            <div className="flex w-full flex-col gap-5">
              <div className="flex flex-col items-start justify-between rounded-lg bg-white p-3 shadow-md xl:h-[490px]">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
                    {namePrefix} {product?.name}
                  </h1>
                  <p className="mt-2 text-3xl font-semibold text-primary">
                    {formatCurrency(product?.price)}
                    {product?.sale && <del className="ml-2 text-base text-gray-400">{formatCurrency(product?.sale)}</del>}
                  </p>
                  <p className="mt-2 text-lg italic text-gray-600">"Sở hữu công nghệ, nâng tầm trải nghiệm"</p>
                  <div className="mt-4 space-y-2">
                    {product?.color && (
                      <p className="text-gray-600">
                        <span className="font-semibold">Màu sắc:</span> {product?.color}
                      </p>
                    )}
                    {product?.ram && (
                      <p className="text-gray-600">
                        <span className="font-semibold">RAM:</span> {product?.ram}
                      </p>
                    )}
                    {product?.status && (
                      <p className="text-gray-600">
                        <span className="font-semibold">Tình trạng:</span> {product?.status}
                      </p>
                    )}
                    {product?.des && <p className="font-medium text-primary">{product?.des}</p>}
                  </div>
                </div>
                <div className="flex w-full flex-col items-center justify-center gap-1">
                  <Button
                    className="mt-6 w-full rounded-lg bg-primary text-white transition-colors hover:bg-primary/90 md:w-64"
                    onClick={() => {
                      const productToBuy = {
                        _id: product?._id,
                        name: product?.name,
                        img: product?.img,
                        price: product?.price,
                        ram: product?.ram,
                        color: product?.color,
                        link: `${basePath}/${slugify(product?.name)}/${product?._id}`,
                      };
                      localStorage.setItem('selectedProduct', JSON.stringify(productToBuy));
                      window.location.href = '/thanh-toan';
                    }}
                  >
                    Mua Ngay
                  </Button>
                  <p className="mt-2 w-full text-start text-sm text-gray-500">*Nhấn "Mua ngay" để xác nhận sản phẩm!</p>
                </div>
              </div>
              <Link href={hotlineUrl}>
                <div className="w-full rounded-lg bg-primary p-4 text-center text-white shadow-md transition-colors hover:bg-primary/90">
                  <p className="text-xl font-bold">Gọi ngay {contact}</p>
                  <p className="text-sm">Để nhận ưu đãi tốt nhất!</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Tab */}
          <div className="w-full">
            <div className="mt-5 flex flex-row items-center justify-center rounded-md border-b-2 border-primary uppercase">
              <div
                className={`w-full cursor-pointer rounded-l-md py-2 text-center font-light transition-all duration-500 ease-in-out ${activeTab === 'specs' ? 'bg-primary font-semibold text-white' : 'bg-white text-primary'}`}
                onClick={() => setActiveTab('specs')}
              >
                <p>Thông số kĩ thuật</p>
              </div>
              <div
                className={`w-full cursor-pointer rounded-r-md py-2 text-center font-light transition-all duration-500 ease-in-out ${activeTab === 'details' ? 'bg-primary font-semibold text-white' : 'bg-white text-primary'}`}
                onClick={() => setActiveTab('details')}
              >
                <p>Bài viết sản phẩm</p>
              </div>
            </div>
            {/*  */}
            <div className="w-full">
              {/* Details */}
              {activeTab === 'specs' && (
                <div className="mt-5 divide-y-[1px] divide-primary divide-opacity-20 rounded-md border border-primary bg-white leading-10 text-black">
                  <h1 className="rounded-sm rounded-b-none bg-primary p-2 text-center text-lg font-light uppercase text-white">
                    Các thông số chi tiết
                  </h1>
                  {fieldMap.map((group) => (
                    <div key={group?.group}>
                      <details className="group transform divide-y-[1px] bg-primary bg-opacity-5">
                        <summary className="flex cursor-pointer items-center justify-between p-2">
                          <span className="font-semibold text-primary">{group?.name}</span>
                          <span className="transform text-primary transition-transform duration-300 ease-in-out group-open:rotate-180">
                            <IoIosArrowDropdownCircle className="text-2xl" />
                          </span>
                        </summary>
                        {group?.fields
                          .filter((field) => {
                            const groupKey = group.group as keyof Product['catalog'];
                            const fieldKey = field.field;
                            const groupValue = product?.catalog?.[groupKey] as Record<string, string>;
                            return groupValue?.[fieldKey];
                          })
                          .map((field) => {
                            const groupKey = group.group as keyof Product['catalog'];
                            const fieldKey = field.field;
                            const groupValue = product?.catalog?.[groupKey] as Record<string, string>;
                            const fieldValue = groupValue?.[fieldKey];

                            return (
                              <div className="flex w-full flex-row items-start justify-between rounded-md bg-white p-2" key={field?.field}>
                                <p>{field?.name}</p>
                                <p className="font-light italic text-gray-700">
                                  {Array.isArray(fieldValue) ? <span>{fieldValue.join(',')}</span> : fieldValue}
                                </p>
                              </div>
                            );
                          })}
                      </details>
                    </div>
                  ))}
                </div>
              )}
              {/* Detailed description */}
              {activeTab === 'details' && (
                <p
                  className="mt-5"
                  dangerouslySetInnerHTML={{
                    __html: product?.catalogContent ?? '',
                  }}
                ></p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
