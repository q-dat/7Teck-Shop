'use client';
import { useEffect, useState } from 'react';
import HeaderResponsive from '@/components/userPage/ui/HeaderResponsive';
import ProductPlaceholders from '@/components/userPage/ProductPlaceholders';
import { scrollToTopInstantly } from '@/utils/scrollToTop';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import imageRepresent from '../../../../../public/image-represent';
import Image from 'next/image';
import { formatCurrency } from '@/utils/formatCurrency';
import { productHref as productHrefFn } from '@/utils/productLinks';
import { useImageErrorHandler } from '@/hooks/useImageErrorHandler';
import { IconType } from 'react-icons';
import { FaDesktop, FaFrown, FaMicrochip } from 'react-icons/fa';
import { MdMemory, MdMonitor } from 'react-icons/md';
import { ProductBase } from '../(san-pham)/ClientProductPage';

type ProductPageProps = {
  title: string;
  products: ProductBase[];
  basePath: string;
};

type SpecKey = Extract<keyof ProductBase, 'ram' | 'cpu' | 'storage' | 'lcd' | 'gpu'>;

const specsToShow: ReadonlyArray<{
  key: SpecKey;
  icon: IconType;
}> = [
  { key: 'ram', icon: MdMemory },
  { key: 'cpu', icon: FaMicrochip },
  { key: 'lcd', icon: MdMonitor },
  { key: 'gpu', icon: FaDesktop },
];

const EXCLUDED_STATUSES = ['hết hàng', 'ngừng kinh doanh', 'ngưng bán'];

export default function ClientUsedProductByCatalogPage({ products, title, basePath }: ProductPageProps) {
  const [loading, setLoading] = useState(true);

  const fallbackSrc = imageRepresent.Fallback;
  const { handleImageError, isImageErrored } = useImageErrorHandler();

  useEffect(() => {
    scrollToTopInstantly();
    setLoading(false);
  }, [products]);

  return (
    <div>
      <HeaderResponsive Title_NavbarMobile="7teck.vn" />

      <div className="py-[60px] xl:pt-0">
        <div className="breadcrumbs px-[10px] py-2 text-sm text-black shadow xl:px-desktop-padding">
          <ul className="font-light">
            <li>
              <Link href="/">Trang Chủ</Link>
            </li>
            <li>
              <Link href="/thiet-bi-da-qua-su-dung">Thiết bị đã qua sử dụng</Link>
            </li>
            <li>
              <Link href="">{title}</Link>
            </li>
          </ul>
        </div>

        <div className="space-y-10 px-2 xl:px-desktop-padding">
          <div className="mt-5 w-full">
            <div className="grid grid-flow-row grid-cols-2 items-start gap-[10px] md:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-7">
              {loading ? (
                <ProductPlaceholders count={12} />
              ) : products.length > 0 ? (
                products.map((product) => {
                  const productHref = productHrefFn(product.slug);
                  const isErrored = isImageErrored(product._id);
                  const src = isErrored || !product.img ? fallbackSrc : product.img;
                  const isExcluded = product.status ? EXCLUDED_STATUSES.includes(product.status.toLowerCase()) : false;

                  return (
                    <section
                      key={product._id}
                      className="group relative flex h-full w-full flex-col justify-between rounded-md border border-primary-lighter text-black"
                    >
                      <div className="w-full">
                        <Link className="relative" aria-label="Xem chi tiết sản phẩm khi ấn vào hình ảnh" href={productHref}>
                          <div className="h-[200px] w-full cursor-pointer overflow-hidden rounded-md rounded-b-none bg-white">
                            <Image
                              src={src}
                              alt={product.name}
                              height={200}
                              width={200}
                              loading="lazy"
                              className="h-full w-full rounded-[5px] rounded-b-none object-contain transition-transform duration-1000 ease-in-out group-hover:scale-110"
                              onError={() => handleImageError(product._id)}
                            />
                          </div>

                          <div className="w-full px-1 pt-1">
                            <p className="text-prod-name-mobile font-medium xl:text-prod-name-desktop xl:group-hover:text-primary">
                              <span>{title}</span>
                              &nbsp;
                              <span>{product.name}</span>
                            </p>

                            <div>
                              {specsToShow.map(({ key, icon: Icon }) => {
                                const value = product[key];

                                if (!value) {
                                  return null;
                                }

                                return (
                                  <div key={key} className="flex items-center">
                                    <Icon size={16} className="text-gray-600" />
                                    <span className="text-xs font-light">{typeof value === 'string' || typeof value === 'number' ? value : ''}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {isExcluded && (
                            <div className="pointer-events-none absolute inset-0 z-50 rounded-md">
                              <div className="absolute inset-0 rounded-md backdrop-blur-[1px]" />
                              <Image
                                src={imageRepresent.soldOut2}
                                alt="Hết hàng"
                                height={80}
                                width={80}
                                loading="lazy"
                                className="absolute -left-[5px] -top-[5px] z-50 h-[80px] w-[80px] object-contain"
                              />
                            </div>
                          )}
                        </Link>
                      </div>

                      <div className="w-full px-1 pb-1">
                        <div className="w-full text-prod-price-mobile xl:text-prod-price-desktop">
                          {product.price === 0 ? (
                            <Link href="/thong-tin-lien-he" className="w-full text-lg font-bold text-price hover:underline">
                              Liên hệ
                            </Link>
                          ) : (
                            <p>
                              <span className="font-semibold text-price">{formatCurrency(product.price)}</span>
                              &nbsp;
                              {product.sale !== 0 && <del className="text-xs font-light text-gray-500">{formatCurrency(product.sale)}</del>}
                            </p>
                          )}
                        </div>

                        <p className="text-xs text-gray-500">Hỗ trợ trả góp.</p>
                        <p className="text-xs text-gray-500">Miễn phí ship nội thành HCM.</p>

                        <Button
                          disabled={isExcluded}
                          size="xs"
                          className={`mt-1 w-full rounded-md border border-primary/20 ${
                            isExcluded ? 'cursor-not-allowed' : 'bg-primary bg-opacity-10 text-primary hover:bg-primary hover:bg-opacity-20'
                          }`}
                          onClick={() => {
                            if (isExcluded) {
                              return;
                            }

                            const productToBuy = {
                              _id: product._id,
                              name: product.name,
                              slug: product.slug,
                              img: product.img,
                              price: product.price,
                              ram: product.ram,
                              color: product.color,
                              link: productHrefFn(product.slug),
                            };

                            localStorage.setItem('selectedProduct', JSON.stringify(productToBuy));
                            window.location.href = '/thanh-toan';
                          }}
                        >
                          {isExcluded ? 'Không khả dụng' : 'Mua Ngay'}
                        </Button>
                      </div>

                      {!isExcluded && product.status && (
                        <div className="absolute -left-[3px] top-0 z-20">
                          <Image height={100} width={60} alt="" loading="lazy" className="h-full w-[60px]" src={imageRepresent.Status} />
                          <p className="absolute top-[1px] w-full pl-1 text-xs font-medium text-white">{product.status}</p>
                        </div>
                      )}
                    </section>
                  );
                })
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-10 text-center">
                  <FaFrown className="mb-4 h-16 w-16 text-gray-400" />
                  <h2 className="text-xl font-semibold text-gray-800 xl:text-3xl">Rất tiếc, không tìm thấy sản phẩm nào!</h2>
                  <p className="mb-6 mt-2 text-gray-500">Có thể danh mục này chưa có sản phẩm hoặc đường dẫn không chính xác.</p>

                  <div className="flex gap-4">
                    <Link
                      href="/"
                      className="rounded-2xl bg-primary px-5 py-2 font-medium text-white shadow transition hover:border hover:border-primary hover:bg-primary-lighter hover:text-primary"
                    >
                      Về Trang Chủ
                    </Link>

                    <Link
                      href="/thong-tin-lien-he"
                      className="rounded-2xl border border-black px-5 py-2 font-medium text-black shadow-sm transition hover:bg-primary-lighter"
                    >
                      Trang Liên Hệ
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
