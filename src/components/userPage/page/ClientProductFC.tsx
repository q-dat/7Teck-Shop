'use client';
import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from 'react-daisyui';
import { MdArrowBackIosNew, MdArrowForwardIos } from 'react-icons/md';
import { FaArrowRight } from 'react-icons/fa';
import { useScroll } from '@/hooks/useScroll';
import { slugify } from '@/utils/slugify';
import { formatCurrency } from '@/utils/formatCurrency';
import ProductPlaceholders from '@/components/userPage/ProductPlaceholders';

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

/**
 * Component nội bộ hiển thị từng thẻ sản phẩm
 * Tối ưu hóa việc render và quản lý trạng thái hover cục bộ
 */
const ProductItem = ({ product, onQuickBuy }: { product: Product; onQuickBuy: (p: Product, url: string) => void }) => {
  const productUrl = `/${slugify(product.name)}/${product._id}`;
  const discountPercentage = useMemo(() => {
    if (!product.sale || product.price <= product.sale) return 0;
    return Math.round(((product.price - product.sale) / product.price) * 100);
  }, [product.price, product.sale]);

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group relative flex h-full min-w-[240px] max-w-[240px] snap-start flex-col border border-neutral-200 bg-white xl:min-w-[280px] xl:max-w-[280px]"
    >
      {/* Khối Media - Tỉ lệ vàng 1:1 cho E-commerce */}
      <div className="relative aspect-square w-full overflow-hidden bg-neutral-50 p-6 transition-colors duration-300 group-hover:bg-neutral-100/50">
        <Link href={productUrl} className="relative block h-full w-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 1280px) 240px, 280px"
            className="object-contain transition-transform duration-700 ease-out group-hover:scale-110"
            loading="lazy"
          />
        </Link>

        {/* Badges tối giản */}
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
          {discountPercentage > 0 && (
            <span className="bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">-{discountPercentage}%</span>
          )}
          {product.status && (
            <span className="bg-neutral-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">{product.status}</span>
          )}
        </div>

        {/* Nút hành động nhanh - Xuất hiện khi hover trên Desktop */}
        <div className="absolute inset-x-4 bottom-4 hidden translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 xl:block">
          <Button
            onClick={() => onQuickBuy(product, productUrl)}
            className="w-full rounded-none border-none bg-neutral-900 text-[10px] font-bold tracking-[0.2em] text-white transition-colors hover:bg-primary"
          >
            MUA NGAY
          </Button>
        </div>
      </div>

      {/* Thông tin chi tiết */}
      <div className="flex flex-col px-1 py-2">
        <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-neutral-400">
          <span>RAM {product.ram || 'Tiêu chuẩn'}</span>
          <span className="font-medium">{product.color}</span>
        </div>

        <Link href={productUrl}>
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug text-neutral-900 transition-colors group-hover:text-primary xl:text-base">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold tracking-tight text-price xl:text-xl">{formatCurrency(product.price)}</span>

          {product.sale !== 0 && <del className="text-xs font-medium text-gray-400 decoration-1">{formatCurrency(product.sale || 0)}</del>}
        </div>

        {/* Thông tin bổ trợ niềm tin (Trust signals) */}
        <div className="mt-2 grid grid-cols-2 gap-2 border-t border-neutral-100 pt-4 text-[9px] font-semibold uppercase tracking-tighter text-neutral-500">
          <div className="flex flex-col">
            <span className="text-neutral-900">Hỗ trợ trả góp</span>
            <span>Xét duyệt nhanh</span>
          </div>
          <div className="flex flex-col border-l border-neutral-100 pl-3">
            <span className="text-neutral-900">Giao hỏa tốc</span>
            <span>Nội thành HCM</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function ClientProductFC({ products, category, loading: externalLoading }: ClientProductFCProps) {
  const router = useRouter();
  const { scrollRef, isLeftVisible, isRightVisible, hasOverflow, scrollBy } = useScroll();
  const [internalLoading, setInternalLoading] = useState(true);

  const loading = externalLoading !== undefined ? externalLoading : internalLoading;

  useEffect(() => {
    if (externalLoading === undefined) {
      setInternalLoading(products.length === 0);
    }
  }, [products, externalLoading]);

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => (b.sale ? -1 : 1));
  }, [products]);

  const handleQuickBuy = (product: Product, productUrl: string) => {
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
    router.push('/thanh-toan');
  };

  if (loading) {
    return (
      <div className="bg-white py-12 xl:px-desktop-padding">
        <div className="mb-8 h-10 w-64 animate-pulse rounded bg-neutral-100" />
        <div className="flex gap-6 overflow-hidden">
          <ProductPlaceholders count={24} />
        </div>
      </div>
    );
  }

  if (sortedProducts.length === 0) return null;

  return (
    <section className="w-full bg-white p-2 xl:px-desktop-padding">
      {/* Header Section: Minimalist & Clean */}
      <div className="mb-2 flex flex-col items-start justify-between gap-2 border-b border-primary pb-2 md:flex-row md:items-center">
        <h2 className="text-xl font-light tracking-tight text-neutral-900 xl:text-2xl">{category.title}</h2>
        <Link
          href={category.url}
        aria-label={category.ariaLabel}
          className="group ml-auto flex items-center text-xs font-bold uppercase tracking-[0.2em] text-neutral-900 transition-colors hover:text-primary"
        >
          Khám phá tất cả
          <MdArrowForwardIos size={18} />
        </Link>
      </div>

      {/* Carousel Container */}
      <div className="relative w-full">
        {hasOverflow && (
          <div className="">
            <button
              aria-label="Cuộn sang trái"
              onClick={() => scrollBy(-390)}
              className={`absolute -left-2 top-1/2 z-[100] -translate-y-1/2 rounded-full border border-gray-400 bg-white p-2 text-black shadow transition-transform duration-200 hover:scale-110 ${
                isLeftVisible ? '' : 'hidden'
              }`}
            >
              <MdArrowBackIosNew className="text-2xl" />
            </button>
            <button
              aria-label="Cuộn sang phải"
              onClick={() => scrollBy(390)}
              className={`absolute -right-2 top-1/2 z-[100] -translate-y-1/2 rounded-full border border-gray-400 bg-white p-2 text-black shadow transition-transform duration-200 hover:scale-110 ${
                isRightVisible ? '' : 'hidden'
              }`}
            >
              <MdArrowForwardIos className="text-2xl" />
            </button>
          </div>
        )}
        <div ref={scrollRef} className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-10 pt-2 scrollbar-hide">
          {sortedProducts.map((product) => (
            <ProductItem key={product._id} product={product} onQuickBuy={handleQuickBuy} />
          ))}

          {/* End Card: View All */}
          <Link
            href={category.url}
            className="group flex min-w-[200px] snap-start items-center justify-center bg-neutral-50 transition-all duration-500 hover:bg-neutral-900 xl:min-w-[240px]"
          >
            <div className="mt-[50px] flex flex-col items-center gap-1 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-neutral-200 bg-white transition-transform duration-500 group-hover:scale-110 group-hover:border-primary group-hover:bg-primary">
                <FaArrowRight className="text-neutral-400 group-hover:text-white" />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-neutral-900 transition-colors group-hover:text-white">Xem toàn bộ</p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
