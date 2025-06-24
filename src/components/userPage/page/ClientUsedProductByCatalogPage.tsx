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
import Image from 'next/image';
import { formatCurrency } from '@/utils/formatCurrency';

type ProductPageProps<T> = {
  data: T[];
  getName: (item: T) => string;
  getImage: (item: T) => string;
  getPrice: (item: T) => number;
  getSale: (item: T) => number | null;
  getView: (item: T) => number;
  getStatus: (item: T) => string | null;
  getId: (item: T) => string;
  buildLink: (slug: string, id: string) => string;
  title: string;
};

export default function ClientUsedProductByCatalogPage<T>({
  data,
  getName,
  getImage,
  getPrice,
  getSale,
  getView,
  getStatus,
  getId,
  buildLink,
  title,
}: ProductPageProps<T>) {
  const [loading, setLoading] = useState(true);
  const { name } = useParams();
  const filtered = data.filter((item) => slugify(getName(item)) === name);

  useEffect(() => {
    scrollToTopSmoothly();
    if (data.length === 0) {
      const fetchData = async () => setLoading(true);
      fetchData();
    } else {
      setLoading(false);
    }
  }, [data]);

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
              <Link href="">{title}</Link>
            </li>
          </ul>
        </div>
        {/*  */}
        <div className="space-y-10 px-2 xl:px-desktop-padding">
          <div className="mt-5 w-full">
            <div className="grid grid-flow-row grid-cols-2 items-start gap-[10px] md:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-7">
              {loading ? (
                <ProductPlaceholders count={12} />
              ) : filtered.length > 0 ? (
                filtered.map((item) => {
                  const name = getName(item);
                  const slug = slugify(name);
                  const image = getImage(item);
                  const price = getPrice(item);
                  const sale = getSale(item);
                  const view = getView(item);
                  const status = getStatus(item);
                  const id = getId(item);
                  const url = buildLink(slug, id);

                  return (
                    <section key={id} className="group relative flex h-full flex-col justify-between rounded-md border border-white text-black">
                      <Link href={url} className="flex h-full w-full items-center justify-center rounded-md rounded-b-none bg-white">
                        <div className="relative h-[200px] w-full overflow-hidden">
                          <Image
                            width={200}
                            height={200}
                            alt="Hình ảnh"
                            loading="lazy"
                            className="absolute left-0 top-0 z-0 h-full w-full rounded-[5px] rounded-b-none object-cover blur-sm filter"
                            src={image}
                          />
                          <Image
                            width={200}
                            height={200}
                            alt="Hình ảnh"
                            loading="lazy"
                            className="absolute left-0 top-0 z-10 h-full w-full rounded-[5px] rounded-b-none object-contain transition-transform duration-1000 ease-in-out hover:scale-110"
                            src={image}
                          />
                        </div>
                      </Link>

                      <div className="flex flex-col items-start justify-center gap-1 p-1">
                        <Link href={url}>
                          <div className="flex w-[50px] items-center justify-start gap-1 rounded-sm p-[2px] text-center text-[12px] text-black">
                            <FaRegEye />
                            <p>{view}</p>
                          </div>
                          <p className="xl:group-hover:text-secondary">
                            {title} {name}
                          </p>
                          <p className="font-[500] text-red-700">
                            {formatCurrency(price)}&nbsp;
                            <del className="text-xs font-light text-gray-400">{sale && formatCurrency(sale)}</del>
                          </p>
                        </Link>
                        <Link href="/thanh-toan" className="z-50 w-full">
                          <Button
                            size="xs"
                            className="w-full rounded-md border-none bg-primary bg-opacity-10 text-primary hover:bg-primary hover:bg-opacity-20"
                          >
                            Mua Ngay
                          </Button>
                        </Link>
                      </div>
                      {/*  */}
                      {status && (
                        <div className="absolute -left-[3px] top-0 z-20">
                          <Image alt="" loading="lazy" width={60} height={100} className="h-full w-[60px]" src={imageRepresent.Status} />
                          <p className="absolute top-[1px] w-full pl-1 text-xs text-white">{status}</p>
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
