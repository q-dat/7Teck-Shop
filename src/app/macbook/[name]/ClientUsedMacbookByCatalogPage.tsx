'use client';
import HeaderResponsive from '@/components/userPage/HeaderResponsive';
import ProductPlaceholders from '@/components/userPage/ProductPlaceholders';
import { scrollToTopSmoothly } from '@/utils/scrollToTopSmoothly';
import { slugify } from '@/utils/slugify';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Button } from 'react-daisyui';
import { FaRegEye } from 'react-icons/fa';
import imageRepresent from '../../../../public/image-represent';
import { IMacbook } from '@/types/type/macbook/macbook';
import Image from 'next/image';
import { formatCurrency } from '@/utils/formatCurrency';

export default function ClientUsedMacbookByCatalogPage({ macbook }: { macbook: IMacbook[] }) {
  const [loading, setLoading] = useState(true);
  const { name } = useParams();
  const filteredPhones = macbook.filter((mac) => slugify(mac?.macbook_name) === name);

  useEffect(() => {
    scrollToTopSmoothly();
    if (macbook.length === 0) {
      const fetchData = async () => {
        setLoading(true);
      };

      fetchData();
    } else {
      setLoading(false);
    }
  }, [macbook]);

  return (
    <div>
      <HeaderResponsive Title_NavbarMobile="Laptop" />
      <div className="py-[60px] xl:pt-0">
        <div className="breadcrumbs px-[10px] py-2 text-sm text-black shadow xl:px-desktop-padding">
          <ul className="font-light">
            <li>
              <Link role="navigation" aria-label="Trang chủ" href="/">
                Trang Chủ
              </Link>
            </li>
            <li>
              <Link role="navigation" aria-label="Laptop" href="">
                Laptop
              </Link>
            </li>
          </ul>
        </div>
        {/*  */}
        <div className="space-y-10 px-2 xl:px-desktop-padding">
          <div className="mt-5 w-full">
            <div className="grid grid-flow-row grid-cols-2 items-start gap-[10px] md:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-7">
              {loading ? (
                <ProductPlaceholders count={12} />
              ) : filteredPhones.length > 0 ? (
                filteredPhones.map((mac) => {
                  const macUrl = slugify(mac.macbook_name);
                  return (
                    <section
                      //   onClick={() => updateMacbookView(mac._id)}
                      key={mac?._id}
                      className="group relative flex h-full flex-col justify-between rounded-md border border-white text-black"
                    >
                      <Link
                        role="navigation"
                        aria-label="Chi tiết sản phẩm"
                        className="flex h-full w-full items-center justify-center rounded-md rounded-b-none bg-white"
                        href={`/macbook/${macUrl}/${mac?._id}`}
                      >
                        <div className="relative h-[200px] w-full overflow-hidden">
                          <Image
                            width={200}
                            height={200}
                            alt="Hình ảnh"
                            loading="lazy"
                            className="absolute left-0 top-0 z-0 h-full w-full rounded-[5px] rounded-b-none object-cover blur-sm filter"
                            src={mac?.macbook_img}
                          />
                          <Image
                            width={200}
                            height={200}
                            alt="Hình ảnh"
                            loading="lazy"
                            className="absolute left-0 top-0 z-10 h-full w-full rounded-[5px] rounded-b-none object-contain transition-transform duration-1000 ease-in-out hover:scale-110"
                            src={mac?.macbook_img}
                          />
                        </div>
                      </Link>
                      {/*  */}
                      <div className="flex flex-col items-start justify-center gap-1 p-1">
                        <Link href={`/imacbook/${macUrl}/${mac?._id}`}>
                          <div className="flex w-[50px] items-center justify-start gap-1 rounded-sm p-[2px] text-center text-[12px] text-black">
                            <FaRegEye />
                            <p>{mac.macbook_view}</p>
                          </div>
                          <p className="xl:group-hover:text-secondary">Laptop {mac?.macbook_name}</p>
                          <p className="font-[500] text-red-700">
                            {formatCurrency(mac?.macbook_price)} &nbsp;
                            <del className="text-xs font-light text-gray-400">{mac?.macbook_sale && `${formatCurrency(mac?.macbook_sale)}`}</del>
                          </p>
                        </Link>
                        <Link role="navigation" aria-label="Mua ngay" href="/thanh-toan" className="z-50 w-full">
                          <Button
                            size="xs"
                            className="w-full rounded-md border-none bg-primary bg-opacity-10 text-primary hover:bg-primary hover:bg-opacity-20"
                          >
                            Mua Ngay
                          </Button>
                        </Link>
                      </div>
                      {/*  */}
                      {mac?.macbook_status && (
                        <div className="absolute -left-[3px] top-0 z-20">
                          <Image alt="" loading="lazy" width={60} height={100} className="h-full w-[60px]" src={imageRepresent.Status} />
                          <p className="absolute top-[1px] w-full pl-1 text-xs text-white">{mac?.macbook_status}</p>
                        </div>
                      )}
                    </section>
                  );
                })
              ) : (
                <div className="col-span-full text-center text-2xl">Rất tiếc. Không tìm thấy sản phẩm nào!</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
