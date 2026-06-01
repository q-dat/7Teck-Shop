'use client';
import Pagination from '@/components/userPage/Pagination';
import ProductPlaceholders from '@/components/userPage/ProductPlaceholders';
import { formatCurrency } from '@/utils/formatCurrency';
import { scrollToTopInstantly } from '@/utils/scrollToTop';
import { contact, hotlineUrl } from '@/utils/socialLinks';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Giữ lại type catalog để sau này cần dùng lại
// export interface UsedProductCatalog {
//   _id: string;
//   name: string;
//   img: string;
//   price: number;
//   productCount: number;
//   status: number;
//   slug: string;
// }

export interface UsedProduct {
  _id: string;
  name: string;
  img: string;
  price: number;
  status: string;
  slug: string;
  basePath: string;
  namePrefix: string;
}

interface ClientUsedProductCatalogPageProps {
  data: UsedProduct[];
  title: string;
}

export default function ClientUsedProductCatalogPage({ data, title }: ClientUsedProductCatalogPageProps) {
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    scrollToTopInstantly();
    setLoading(false);
    setCurrentPage(1);
  }, [data]);

  const itemsPerPage = 12;
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const currentItems = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div className="my-5 rounded-md bg-white p-2">
      {title && <h1 className="bg-white/50 py-2 text-start text-xl font-bold uppercase text-primary backdrop-blur-md md:text-xl">{title}</h1>}
      <p className="flex w-full flex-col items-start gap-1 rounded-md bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-2 text-xs text-gray-700 xl:flex-row xl:gap-3">
        <span className="font-medium">Hàng chuẩn, giá mềm - An tâm mua sắm.</span>
        <Link href={hotlineUrl}>
          <span className="rounded-xl bg-primary px-2 py-[2px] text-white xl:py-1">Gọi/Zalo: {contact}</span>
        </Link>
      </p>

      <div className="grid grid-flow-row grid-cols-2 items-start gap-0 py-2 md:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8">
        {loading ? (
          <ProductPlaceholders count={12} />
        ) : (
          currentItems.map((product) => {
            const productHref = `/${product.basePath}/${product.slug}/${product._id}`;

            return (
              <div
                key={product._id}
                className="group flex h-full w-full flex-col justify-between rounded-none border border-primary-lighter bg-white text-black"
              >
                <div className="w-full">
                  <div className="h-[200px] w-full cursor-pointer overflow-hidden rounded-md rounded-b-none bg-white">
                    <Link href={productHref}>
                      <Image
                        height={200}
                        width={200}
                        alt={product.name}
                        loading="lazy"
                        className="h-full w-full rounded-[5px] rounded-b-none object-contain transition-transform duration-1000 ease-in-out group-hover:scale-110"
                        src={product.img}
                      />
                    </Link>
                  </div>

                  <div className="w-full cursor-pointer p-1">
                    <Link href={productHref}>
                      <p className="text-prod-name-mobile font-medium xl:text-prod-name-desktop xl:group-hover:text-primary">
                        {product.namePrefix} {product.name}
                      </p>
                    </Link>
                  </div>
                </div>

                <div className="flex w-full flex-col items-start justify-between gap-1 p-1">
                  <p className="text-prod-price-mobile text-gray-700 xl:text-prod-price-desktop">
                    Giá:&nbsp;
                    <span className="font-semibold text-price">{formatCurrency(product.price)}</span>
                  </p>

                  <p className="text-xs text-gray-500">Hỗ trợ trả góp.</p>
                  <p className="text-xs text-gray-500">Miễn phí ship nội thành HCM.</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onNextPage={handleNextPage} onPrevPage={handlePrevPage} />
    </div>
  );
}
