'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { slugify } from '@/utils/slugify';
import { scrollToTopSmoothly } from '@/utils/scrollToTopSmoothly';
import { formatCurrency } from '@/utils/formatCurrency';
import ProductPlaceholders from '@/components/userPage/ProductPlaceholders';
import Pagination from '@/components/userPage/Pagination';
import HeaderResponsive from '@/components/userPage/HeaderResponsive';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from 'react-daisyui';
import imageRepresent from '../../../../public/image-represent';

interface ProductBase {
  _id: string;
  name: string;
  image: string;
  price: number;
  sale?: number;
  status?: string;
}

interface ClientProductPageProps {
  products: ProductBase[];
  title: string;
  basePath: string; // dùng để tạo link động, ví dụ 'dien-thoai' hay 'macbook'
}

export default function ClientProductPage({ products, title, basePath }: ClientProductPageProps) {
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    scrollToTopSmoothly();
    setLoading(products.length === 0);
  }, [products]);

  const itemsPerPage = 12;
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div>
      <HeaderResponsive Title_NavbarMobile={title} />
      <div className="py-[60px] xl:pt-0">
        <div className="breadcrumbs px-[10px] py-2 text-sm text-black shadow xl:px-desktop-padding">
          <ul className="font-light">
            <li>
              <Link href="/">Trang Chủ</Link>
            </li>
            <li>
              <Link href={`/${basePath}`}>{title}</Link>
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
                currentProducts.map((product) => {
                  // Navigate
                  const productUrl = slugify(product.name);
                  const subUrl = product._id;
                  return (
                    <section
                      key={product?._id}
                      className="group relative flex h-full w-full flex-col justify-between rounded-md border border-white text-black"
                    >
                      <div
                        onClick={() => router.push(`/dien-thoai/${productUrl}/${subUrl}`)}
                        className="relative h-[200px] w-full cursor-pointer overflow-hidden rounded-md rounded-b-none"
                      >
                        <Image
                          height={200}
                          width={200}
                          alt="Hình ảnh"
                          loading="lazy"
                          className="absolute left-0 top-0 z-0 h-full w-full rounded-[5px] rounded-b-none object-cover blur-xl filter"
                          src={product?.image}
                        />
                        <Image
                          height={200}
                          width={200}
                          alt="Hình ảnh"
                          loading="lazy"
                          className="absolute left-0 top-0 z-10 h-full w-full rounded-[5px] rounded-b-none object-contain transition-transform duration-1000 ease-in-out hover:scale-110"
                          src={product?.image}
                        />
                      </div>
                      {/*  */}
                      <div className="flex w-full flex-col items-start justify-between p-1">
                        <div className="w-full cursor-pointer" onClick={() => router.push(`/dien-thoai/${productUrl}`)}>
                          <p className="xl:group-hover:text-secondary">Điện Thoại {product.name}</p>
                        </div>
                        <div className="w-full">
                          <p className="text-gray-700">
                            &nbsp;
                            <span className="font-semibold text-red-700">{formatCurrency(product?.price)}</span>
                            &nbsp;
                            {product?.sale && <del className="text-xs font-light text-gray-100">{formatCurrency(product?.sale)}</del>}
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
                      {product?.status && (
                        <div className="absolute -left-[3px] top-0 z-20">
                          <Image height={100} width={60} alt="" loading="lazy" className="h-full w-[60px]" src={imageRepresent.Status} />
                          <p className="absolute top-[1px] w-full pl-1 text-xs text-white">{product?.status}</p>
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
