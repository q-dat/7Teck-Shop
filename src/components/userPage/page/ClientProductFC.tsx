'use client';

import { useScroll } from '@/hooks/useScroll';
import { slugify } from '@/utils/slugify';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Button } from 'react-daisyui';
import { MdArrowBackIosNew, MdArrowForwardIos } from 'react-icons/md';
import { FaShoppingCart, FaArrowRight } from 'react-icons/fa';
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
    name: string;
    url: string;
    title: string;
    ariaLabel: string;
  };
  loading?: boolean;
}

export default function ClientProductFC({ products, category, loading: externalLoading }: ClientProductFCProps) {
  const { scrollRef, isLeftVisible, isRightVisible, scrollBy } = useScroll();
  const [internalLoading, setInternalLoading] = useState(true);

  const loading = externalLoading !== undefined ? externalLoading : internalLoading;

  useEffect(() => {
    if (externalLoading === undefined) {
      setInternalLoading(products.length === 0);
    }
  }, [products, externalLoading]);

  const sortedProducts = React.useMemo(() => {
    return [...products].sort((a, b) => (b.sale ? 1 : 0) - (a.sale ? 1 : 0));
  }, [products]);

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

  if (sortedProducts.length === 0) return null;

  return (
    <div className="w-full border-t border-black/5 bg-white px-2 py-8 xl:p-0 xl:px-desktop-padding">
      {/* --- Header Section: Clean & Sharp --- */}
      <div className="mb-8 mt-2 flex flex-col items-start justify-between gap-2 md:flex-row md:items-end xl:px-0">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-black xl:text-4xl">{category.title}</h2>
          <div className="h-1 w-12 rounded-sm bg-black"></div> {/* Divider đen đậm */}
          <p className="mt-1 text-sm font-medium text-gray-500">Lựa chọn tốt nhất dành cho bạn</p>
        </div>

        <Link
          href={category.url}
          aria-label={category.ariaLabel}
          className="group flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-black transition-all hover:opacity-70"
        >
          Xem tất cả
          <span className="flex h-6 w-6 items-center justify-center rounded-md border border-black transition-all group-hover:bg-black group-hover:text-white">
            <MdArrowForwardIos className="text-xs" />
          </span>
        </Link>
      </div>

      {/* --- Product Carousel --- */}
      <div className="group/section relative">
        {/* Navigation Buttons: Square & Black */}
        {isLeftVisible && (
          <button
            onClick={() => scrollBy(-320)}
            className="absolute -left-4 top-1/2 z-30 hidden -translate-y-1/2 rounded-md border border-black bg-white p-3 text-black transition-all hover:bg-black hover:text-white xl:block"
          >
            <MdArrowBackIosNew size={20} />
          </button>
        )}

        {isRightVisible && (
          <button
            onClick={() => scrollBy(320)}
            className="absolute -right-4 top-1/2 z-30 hidden -translate-y-1/2 rounded-md border border-black bg-white p-3 text-black transition-all hover:bg-black hover:text-white xl:block"
          >
            <MdArrowForwardIos size={20} />
          </button>
        )}

        {/* Scrollable Container */}
        <section ref={scrollRef} className="flex touch-pan-x snap-x snap-mandatory gap-2 overflow-x-auto px-2 pb-10 pt-2 scrollbar-hide">
          {sortedProducts.map((product) => {
            const productUrl = `/${slugify(product.name)}/${product._id}`;
            const discountPercentage =
              product.sale && product.price > product.sale ? Math.round(((product.price - product.sale) / product.price) * 100) : 0;

            return (
              <div
                key={product._id}
                // Thay đổi chính: Bỏ shadow mềm, dùng border trong suốt chuyển sang đen khi hover
                className="group relative flex h-full min-w-[200px] max-w-[200px] snap-start flex-col justify-between overflow-hidden rounded-md border border-gray-200 bg-white transition-all duration-300 hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] xl:min-w-[260px] xl:max-w-[260px]"
              >
                {/* Badges */}
                <div className="absolute left-2 top-2 z-10 flex flex-col gap-2">
                  {discountPercentage > 0 && (
                    <span className="w-fit rounded-md bg-black px-2 py-1 text-[12px] font-bold text-white">-{discountPercentage}%</span>
                  )}
                  {product.status && (
                    <span className="w-fit rounded-md border border-black bg-white px-2 py-1 text-[10px] font-bold uppercase text-black">
                      {product.status}
                    </span>
                  )}
                </div>

                {/* Image Area */}
                <Link href={productUrl} target="_blank" className="relative block aspect-square w-full overflow-hidden bg-white p-3">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={260}
                    height={260}
                    // Bỏ mix-blend nếu nền đã trắng, giữ object-contain
                    className="h-full w-full object-contain transition-transform duration-500 ease-in-out group-hover:scale-110"
                    loading="lazy"
                  />
                </Link>

                {/* Content Area */}
                <div className="flex flex-1 flex-col p-2">
                  {/* Title */}
                  <Link href={productUrl} target="_blank" title={product.name}>
                    <h3 className="line-clamp-2 min-h-[48px] text-sm font-bold leading-tight text-gray-900 transition-colors hover:text-black xl:text-lg">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Specs: Clean Text, No Background Pills */}
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-gray-600">
                    {[product.ram, product.color].filter(Boolean).map((spec, i) => (
                      <div key={i} className="flex items-center gap-2">
                        {i > 0 && <span className="h-3 w-[1px] bg-black"></span>} {/* Separator line */}
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>

                  {/* Price Area */}
                  <div className="mt-4 flex flex-col">
                    <div className="flex items-baseline gap-3">
                      <span className="text-lg font-black text-price xl:text-xl">{formatCurrency(product.sale || product.price)}</span>
                      {product.sale !== 0 && <del className="text-xs font-medium text-gray-400 decoration-1">{formatCurrency(product.price)}</del>}
                    </div>
                    <p className="text-xs text-gray-500">Hỗ trợ trả góp.</p>
                    <p className="text-xs text-gray-500">Miễn phí ship nội thành HCM.</p>
                  </div>

                  {/* Action Button: Solid Black, Square */}
                  <Button
                    size="sm"
                    className="mt-4 w-full gap-2 rounded-md border-none bg-black text-white transition-all duration-300 hover:bg-gray-800 xl:translate-y-2 xl:opacity-0 xl:group-hover:translate-y-0 xl:group-hover:opacity-100"
                    onClick={(e) => {
                      e.preventDefault();
                      const productToBuy = {
                        _id: product._id,
                        name: product.name,
                        img: product.image,
                        price: product.sale || product.price,
                        ram: product.ram,
                        color: product.color,
                        link: productUrl,
                      };
                      localStorage.setItem('selectedProduct', JSON.stringify(productToBuy));
                      window.location.href = '/thanh-toan';
                    }}
                  >
                    <FaShoppingCart size={14} /> MUA NGAY
                  </Button>
                </div>
              </div>
            );
          })}

          {/* Card "Xem Thêm": Minimalist Border Style */}
          <Link
            href={category.url}
            className="group flex min-w-[120px] snap-start items-center justify-center rounded-md border border-dashed border-gray-300 bg-white transition-all hover:border-black hover:bg-black hover:text-white xl:min-w-[180px]"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-md border border-gray-300 transition-colors group-hover:border-white">
                <FaArrowRight size={16} />
              </div>
              <span className="text-sm font-bold uppercase tracking-wider">Xem tất cả</span>
            </div>
          </Link>
        </section>
      </div>
    </div>
  );
}
