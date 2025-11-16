'use client';
import { LoadingLocal } from '@/components/orther/loading';
import HeaderResponsive from '@/components/userPage/ui/HeaderResponsive';
import Zoom from '@/lib/Zoom';
import { scrollBy, updateScrollButtons, handleScrollButtons, handleThumbnailClick } from '@/utils/DetailPage/scrollUtils';
import { formatCurrency } from '@/utils/formatCurrency';
import { scrollToTopInstantly } from '@/utils/scrollToTop';
import { slugify } from '@/utils/slugify';
import { contact, hotlineUrl } from '@/utils/socialLinks';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Button } from 'react-daisyui';
import { IoIosArrowDropdownCircle, IoMdCheckmarkCircleOutline } from 'react-icons/io';
import { MdArrowBackIosNew, MdArrowForwardIos, MdMemory, MdOutlineInvertColors } from 'react-icons/md';
import imageRepresent from '../../../../public/image-represent';
import { useImageErrorHandler } from '@/hooks/useImageErrorHandler';
import { FaFacebookSquare } from 'react-icons/fa';
import { handleProductShare } from '@/helper/handleShare';
import { TfiRulerPencil } from 'react-icons/tfi';
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
  relatedProducts?: Product[];
}
const EXCLUDED_STATUSES = ['Ngừng kinh doanh', 'Hết hàng', 'Ngưng bán'];

export default function ClientProductDetailPage({ product, fieldMap, namePrefix, basePath, relatedProducts }: ClientProductDetailPageProps) {
  const [selectedImage, setSelectedImage] = useState<string | null | undefined>(null);
  // check sản phẩm có hợp lệ để mua không
  const isExcluded = product?.status && EXCLUDED_STATUSES.includes(product.status);

  const [activeTab, setActiveTab] = useState<string>('specs');
  const [isLeftButtonVisible, setIsLeftButtonVisible] = useState(true);
  const [isRightButtonVisible, setIsRightButtonVisible] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null!);
  const [loading, setLoading] = useState(true);
  const thumbnails = [product?.img, ...(product?.thumbnail || [])];
  // Image error
  const fallbackSrc = imageRepresent.Fallback;
  const { handleImageError, isImageErrored } = useImageErrorHandler();
  const isErrored = isImageErrored(product._id);
  const src = isErrored || !product.img ? fallbackSrc : product?.img;

  useLayoutEffect(() => {
    if (product && product?.catalog) {
      setLoading(false);
    }

    const timeout = setTimeout(() => {
      updateScrollButtons(scrollRef, setIsLeftButtonVisible, setIsRightButtonVisible);
    }, 100);

    return () => clearTimeout(timeout);
  }, [product, product?.thumbnail]);

  useEffect(() => {
    scrollToTopInstantly();
    const cleanup = handleScrollButtons(scrollRef, Object.keys(product?.catalog || {}).length, () =>
      updateScrollButtons(scrollRef, setIsLeftButtonVisible, setIsRightButtonVisible)
    );
    return cleanup;
  }, [product]);

  if (loading || !product || !product?.catalog) {
    return <LoadingLocal />;
  }

  const handleScrollTo = (targetId: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (!target) return;

    // Offset theo breakpoint
    const offset = window.innerWidth >= 1280 ? 150 : 70;
    const y = target.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({
      top: y,
      behavior: 'smooth',
    });
  };

  return (
    <div>
      <HeaderResponsive Title_NavbarMobile="7teck.vn" />
      <div className="py-[60px] xl:pt-0">
        <div className="breadcrumbs px-[10px] py-2 text-sm text-black shadow xl:px-desktop-padding">
          <ul className="font-light">
            <li>
              <Link role="navigation" aria-label="Trang chủ" href="/">
                Trang Chủ
              </Link>
            </li>
            <li>
              <Link role="navigation" aria-label={namePrefix} href="">
                {namePrefix}
              </Link>
            </li>
          </ul>
        </div>
        <div className="mt-2 px-2 xl:px-[150px]">
          {/*  */}
          <div className="my-4 flex w-full flex-row items-center justify-between xl:justify-start xl:gap-10">
            {/* Tên sản phẩm – chỉ hiện ở desktop */}
            <p className="hidden xl:block xl:text-xl xl:font-semibold xl:text-gray-900">{product?.name}</p>
            {/*  */}
            <div className="flex flex-row gap-5">
              {[
                { id: 'cam-ket', label: 'Cam Kết', icon: <IoMdCheckmarkCircleOutline fontSize={18} /> },
                { id: 'thong-so', label: 'Thông Số', icon: <TfiRulerPencil fontSize={18} /> },
              ].map((link) => (
                <Link
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={handleScrollTo(link.id)}
                  className="flex flex-row items-center gap-px text-blue-600"
                >
                  {link.icon}
                  <span className="text-sm font-medium">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Sản Phẩm */}
          <div className="flex flex-col items-start justify-start gap-5 xl:flex-row">
            {/* IMG */}
            <div className="flex w-full flex-col gap-5">
              <h1 className="block text-2xl font-bold text-gray-800 md:text-3xl xl:hidden">
                <span>
                  {namePrefix} {product?.name}
                </span>
                {product?.status && (
                  <sup className="mx-2 rounded-md border border-primary bg-primary-lighter p-1 text-sm font-semibold text-primary">
                    {product?.status}
                  </sup>
                )}
              </h1>
              <div className="relative w-full">
                <div className="relative h-[200px] w-full overflow-hidden rounded-md bg-white object-cover xl:h-[480px]">
                  <Zoom>
                    <Image
                      priority
                      width={500}
                      height={500}
                      src={selectedImage || src}
                      alt={product?.name || 'Hình ảnh'}
                      className="absolute left-0 top-0 z-10 h-[200px] w-full rounded-md object-contain xl:h-[480px] xl:w-full"
                      onError={() => handleImageError(product._id)}
                    />
                  </Zoom>

                  {isExcluded && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-md bg-default/40">
                      {/* <span className="-rotate-45 rounded-md bg-primary px-3 py-2 text-2xl font-bold uppercase text-white xl:text-4xl">
                        {product?.status || 'HẾT HÀNG'}!
                      </span> */}
                      <Image
                        src={imageRepresent.soldOut}
                        alt="Hết Hàng"
                        height={200}
                        width={200}
                        loading="lazy"
                        className="z-10 h-[200px] w-[200px] xl:h-[300px] xl:w-[300px]"
                      />
                    </div>
                  )}
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
                        width={70}
                        height={70}
                        loading="lazy"
                        key={index}
                        src={thumb}
                        alt="Ảnh thu nhỏ"
                        className={`h-[70px] w-[70px] cursor-pointer rounded-md border object-contain ${
                          selectedImage === thumb ? 'border-2 border-dashed border-primary' : ''
                        }`}
                        onClick={() => handleThumbnailClick(scrollRef, thumb, index, setSelectedImage)}
                        onLoad={() => updateScrollButtons(scrollRef, setIsLeftButtonVisible, setIsRightButtonVisible)}
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
            <div className="w-full select-none">
              <div className="flex flex-col items-start justify-between rounded-lg bg-white p-3 shadow-md xl:min-h-[480px]">
                <div className="flex flex-col gap-2">
                  <h1 className="hidden text-2xl font-bold text-gray-800 md:text-3xl xl:block">
                    <span>
                      {namePrefix} {product?.name}
                    </span>
                    {product?.status && (
                      <sup className="mx-2 rounded-md border border-primary bg-primary-lighter p-1 text-sm font-semibold text-primary">
                        {product?.status}
                      </sup>
                    )}
                  </h1>
                  {/* Price */}
                  <p className="text-3xl font-semibold text-price">
                    {formatCurrency(product?.price)}
                    {product?.sale && <del className="ml-2 text-base text-gray-400">{formatCurrency(product?.sale)}</del>}
                  </p>
                  {/* Product details */}
                  <div className="w-full">
                    <p className="text-sm font-semibold text-black">
                      Đặc điểm: <span className="text-xs text-secondary">({product?.ram && 'Dung lượng RAM & '}Màu Sắc)</span>
                    </p>
                    <div className="flex flex-wrap items-center justify-start gap-2">
                      {[
                        { key: 'ram', label: product?.ram, icon: <MdMemory size={18} /> },
                        { key: 'color', label: product?.color, icon: <MdOutlineInvertColors size={18} /> },
                      ]
                        .filter((item) => item.label)
                        .map((item) => (
                          <div
                            key={item.key}
                            className="flex items-center justify-center gap-1 rounded-md border border-dashed border-black bg-primary-lighter px-2 py-0.5 font-semibold text-black shadow-sm transition-all hover:shadow-md"
                          >
                            {item.icon}
                            <span className="text-sm">{item.label}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                  {/* Related Products */}
                  <div className="w-full">
                    <p className="text-sm font-semibold text-black">Lựa chọn liên quan:</p>
                    {relatedProducts && relatedProducts.length > 1 && (
                      <div className="flex flex-wrap items-center justify-start gap-2">
                        {/* Map through related products */}
                        {relatedProducts
                          .filter((item) => item._id !== product._id)
                          .map((item) => (
                            <Link
                              key={item._id}
                              href={`/${basePath}/${slugify(item.name)}/${item._id}`}
                              className="flex flex-row items-center justify-center gap-2 rounded-md border border-primary/50 bg-white px-2 py-1 shadow transition-all hover:scale-105 hover:border-dashed hover:shadow-md"
                            >
                              <Image src={item.img} alt={item.name} width={40} height={40} className="h-[40px] w-[40px] object-contain" />
                              <div className="font-semibold">
                                <p>{item.color}</p>
                                <p className="text-price">{formatCurrency(item.price)}</p>
                              </div>
                            </Link>
                          ))}
                      </div>
                    )}
                  </div>
                  {/* Des */}
                  {product?.des ? (
                    <>
                      <p className="whitespace-pre-line text-sm font-medium text-black">{product?.des}</p>
                    </>
                  ) : (
                    <div className="mt-2 flex flex-col">
                      <p className="text-base font-medium italic text-gray-600">{`"Sở hữu công nghệ, nâng tầm trải nghiệm"`}</p>
                      <p className="text-sm font-light text-secondary">Khám phá hiệu năng vượt trội với thiết kế tối ưu và bền bỉ.</p>
                      <p className="text-sm font-light text-secondary">Trải nghiệm sự khác biệt ngay hôm nay với sản phẩm chính hãng.</p>
                    </div>
                  )}
                </div>

                {/* Btn */}
                <div className="flex w-full flex-col items-center justify-center gap-1">
                  <Button
                    disabled={isExcluded ? true : false}
                    className={`mt-6 w-full rounded-lg text-white transition-colors md:w-64 ${
                      isExcluded ? 'cursor-not-allowed bg-gray-400' : 'bg-primary hover:bg-primary/90'
                    }`}
                    onClick={() => {
                      if (isExcluded) return; // chặn hẳn
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
                    {isExcluded ? 'Không khả dụng' : 'Mua Ngay'}
                  </Button>

                  {/*  */}
                  <div className="mt-2 flex w-full flex-col justify-between gap-1 text-blue-800 xl:flex-row">
                    {/* Bên trái */}
                    <div>
                      <span className="text-sm text-gray-700">{`*Nhấn "Mua ngay" để xác nhận sản phẩm!`}</span>
                    </div>
                    {/* Bên phải */}
                    <div className="flex flex-row items-center gap-1 text-blue-900">
                      <span className="text-sm font-medium">Chia sẽ sản phẩm này:</span>
                      <button aria-label="Chia sẻ sản phẩm" onClick={() => handleProductShare(basePath, product.name, product._id)}>
                        <FaFacebookSquare className="text-xl" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {/* Contact */}
              <Link href={hotlineUrl}>
                <div className="mt-5 w-full rounded-lg bg-primary-lighter p-2 text-center text-primary shadow-md transition-colors">
                  <p className="text-xl font-bold">Gọi ngay {contact}</p>
                  <p className="text-sm">Để nhận ưu đãi tốt nhất!</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Cam Kết */}
          <div id="cam-ket" className="my-6 w-full">
            <div className="flex flex-col gap-3 rounded-lg border border-secondary/20 bg-white p-2 shadow-sm xl:p-6">
              <h2 className="text-center text-lg font-bold uppercase text-secondary">7teck cam kết</h2>

              <ul className="mt-2 flex flex-col gap-2 text-sm text-gray-700">
                {/* Cam kết */}
                <li className="rounded-md bg-secondary/5 p-2 leading-relaxed">• Máy nguyên zin đúng phiên bản quý khách chọn.</li>

                <li className="rounded-md bg-secondary/5 p-2 leading-relaxed">
                  • Bao test 7 ngày và bảo hành 3 tháng / 6 tháng / 1 năm tùy dòng sản phẩm.
                </li>

                <li className="rounded-md bg-secondary/5 p-2 leading-relaxed">• Hỗ trợ trả góp qua thẻ tín dụng nhanh chóng, thao tác đơn giản.</li>

                <li className="rounded-md bg-secondary/5 p-2 leading-relaxed">• Tặng kèm cường lực và ốp lưng miễn phí.</li>

                {/* Bộ sản phẩm bao gồm */}

                <li className="rounded-md bg-secondary/5 p-2 leading-relaxed">• Ốp lưng bảo vệ và kính cường lực được tặng kèm.</li>

                <li className="rounded-md bg-secondary/5 p-2 leading-relaxed">• Phiếu bảo hành 7teck theo thời hạn từng sản phẩm.</li>
              </ul>
            </div>
          </div>

          {/* Thông Số */}
          <div id="thong-so" className="w-full">
            <div className="mt-5 flex flex-row items-center justify-center rounded-md border-b-2 border-secondary uppercase">
              <div
                className={`w-full cursor-pointer rounded-l-md py-2 text-center font-light transition-all duration-500 ease-in-out ${activeTab === 'specs' ? 'bg-secondary font-semibold text-white' : 'bg-white text-black'}`}
                onClick={() => setActiveTab('specs')}
              >
                <p>Thông số kĩ thuật</p>
              </div>
              <div
                className={`w-full cursor-pointer rounded-r-md py-2 text-center font-light transition-all duration-500 ease-in-out ${activeTab === 'details' ? 'bg-secondary font-semibold text-white' : 'bg-white text-black'}`}
                onClick={() => setActiveTab('details')}
              >
                <p>Bài viết sản phẩm</p>
              </div>
            </div>
            {/*  */}
            <div className="w-full">
              {/* Details */}
              {activeTab === 'specs' && (
                <div className="mt-5 divide-y-[1px] divide-secondary divide-opacity-20 rounded-md border border-secondary bg-white leading-10 text-black">
                  <h1 className="rounded-sm rounded-b-none bg-secondary p-2 text-center text-lg font-light uppercase text-white">
                    Các thông số chi tiết
                  </h1>
                  {fieldMap.map((group, index) => (
                    <div key={group?.group}>
                      <details open={index < 2} className="group transform divide-y-[1px] bg-secondary/5">
                        <summary className="flex cursor-pointer items-center justify-between p-2">
                          <span className="font-semibold text-secondary">{group?.name}</span>
                          <span className="transform text-secondary transition-transform duration-300 ease-in-out group-open:rotate-180">
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
              {activeTab === 'details' &&
                (product?.catalogContent?.trim() ? (
                  <p
                    className="mt-5"
                    dangerouslySetInnerHTML={{
                      __html: product.catalogContent,
                    }}
                  />
                ) : (
                  <p className="mt-6 rounded-lg bg-primary/5 p-4 text-center text-base font-medium text-primary xl:text-lg">
                    Hiện tại chưa có bài viết cho sản phẩm này.
                  </p>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
