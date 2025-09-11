'use client';
import HeaderResponsive from '@/components/userPage/ui/HeaderResponsive';
import { memo, useEffect, useState } from 'react';
import ClientPhoneFC from '../components/userPage/ClientPhoneFC';
import ClientProductFC, { Product } from '../components/userPage/page/ClientProductFC';
import ClientPostSection from '../components/userPage/ClientPostSection';
import { IMacbook } from '@/types/type/products/macbook/macbook';
import { IPost } from '@/types/type/products/post/post';
import Image from 'next/image';
import { images } from '../../public/images';
import { IPhone } from '@/types/type/products/phone/phone';
import { ITablet } from '@/types/type/products/tablet/tablet';
import { IWindows } from '@/types/type/products/windows/windows';
import Link from 'next/link';
import BgFixedSection from '@/components/userPage/BgFixedSection';
import BenefitsSection from '@/components/userPage/BenefitsSection';
import ZigzagSection from '@/components/userPage/ZigzagSection/ZigzagSection';

// Thành phần Banner
const BannerComponent = memo(() => (
  <div className="relative">
    {/* <div className="absolute bottom-0 left-0 top-0 h-full w-full bg-black bg-opacity-10 pl-2 pt-[20%] md:pl-20 md:pt-5 xl:pl-[100px] xl:pt-[4%]">
      <h1 className="text-[25px] font-extrabold text-white xl:text-[40px]">
        Đổi Điện Thoại Cũ, <br />
        Nhận Ngay Giá Tốt Nhất!
        </h1>
        <h2 className="w-[120px] bg-gradient-to-r from-primary via-primary to-transparent text-start text-[20px] font-thin italic text-white">
        up to 90%
      </h2>
    </div> */}
    <div className="absolute inset-0 flex flex-col justify-end gap-4 bg-gradient-to-tr from-primary/30 via-default/30 to-transparent px-2 pb-5 xl:px-desktop-padding">
      {/* Tagline */}
      <span className="relative inline-block w-fit text-sm font-semibold uppercase tracking-wider text-white md:text-base">
        Ưu đãi trao đổi
        <span className="absolute -bottom-1 left-0 h-[2px] w-8 rounded-full bg-yellow-300"></span>
      </span>
      {/* Tiêu đề và mô tả */}
      <div className="w-full">
        <h1 className="text-2xl font-extrabold leading-snug text-white drop-shadow-md 2xl:text-3xl">
          Thu Cũ Đổi Mới
          <br />
          Nhận Ngay Giá Tốt Nhất!
        </h1>
        {/*  */}
        <p className="w-full text-sm font-light text-white/95 drop-shadow-sm md:text-lg">
          Lên đến <i className="text-xl font-bold text-yellow-300">90%</i> giá trị sản phẩm - uy tín, minh bạch.
        </p>
      </div>
      {/* Nút hành động */}
      <div className="flex flex-wrap gap-3 text-xs md:text-lg">
        <Link
          href="/bang-gia-thu-mua"
          className="rounded-md bg-gradient-to-r from-primary via-primary/90 to-primary p-2 font-medium text-white shadow-lg transition-all duration-300 focus:outline-none hover:scale-105 hover:border hover:border-black hover:shadow-[0_0_15px_#a92d30,0_0_30px_#d13b3e]"
        >
          Điều Kiện Áp Dụng
        </Link>
        {/*  */}
        {/* <Link
          href="/bang-gia-thu-mua"
          className="rounded-md border border-white p-2 font-light text-white transition-all duration-300 focus:outline-none hover:scale-105 hover:border-primary hover:text-primary-lighter hover:shadow-[0_0_10px_#a92d30,0_0_20px_#d13b3e]"
        >
          Điều Kiện Áp Dụng
        </Link> */}
      </div>
    </div>
    {/* Hình ảnh nền */}
    <picture className="h-full w-full">
      <source srcSet={`${images.BannerDesktop}`} media="(min-width: 1024px)" />
      <source srcSet={`${images.BannerTablet}`} media="(min-width: 601px)" />
      <Image height={100} width={100} src={`${images.BannerMobile}`} alt="Banner" className="h-full w-full object-cover" loading="eager" />
    </picture>
  </div>
));
BannerComponent.displayName = 'BannerComponent';
const Banner = memo(BannerComponent);

interface ClientHomePageProps {
  mostViewedPhones: IPhone[];
  macbook: IMacbook[];
  tablets: ITablet[];
  windows: IWindows[];
  news: IPost[];
  tricks: IPost[];
}

export default function ClientHomePage({ mostViewedPhones, tablets, macbook, windows, news, tricks }: ClientHomePageProps) {
  const [loading, setLoading] = useState(true);

  // Kiểm tra trạng thái tải dựa trên mostViewedPhones
  useEffect(() => {
    if (mostViewedPhones.length === 0) {
      const fetchData = async () => {
        setLoading(true);
      };
      fetchData();
    } else {
      setLoading(false);
    }
  }, [mostViewedPhones]);

  // Ánh xạ dữ liệu
  const transformTablets: Product[] = tablets.map((item) => ({
    _id: item._id,
    name: item.tablet_name || '',
    price: item.tablet_price || 0,
    sale: item.tablet_sale || 0,
    image: item.tablet_img || '',
    status: item.tablet_status || '',
    color: item.tablet_color || '',
    ram: item.tablet_catalog_id.t_cat_memory_and_storage.t_cat_ram || '',
  }));

  const transformMacbook: Product[] = macbook.map((item) => ({
    _id: item._id,
    name: item.macbook_name || '',
    price: item.macbook_price || 0,
    sale: item.macbook_sale || 0,
    image: item.macbook_img || '',
    status: item.macbook_status || '',
    color: item.macbook_color || '',
    ram: item.macbook_catalog_id.m_cat_memory_and_storage.m_cat_ram || '',
  }));

  const transformWindows: Product[] = windows.map((item) => ({
    _id: item._id,
    name: item.windows_name || '',
    price: item.windows_price || 0,
    sale: item.windows_sale || 0,
    image: item.windows_img || '',
    status: item.windows_status || '',
    color: item.windows_color || '',
    ram: item.windows_catalog_id.w_cat_memory_and_storage.w_cat_ram || '',
  }));

  // Cấu hình danh mục sản phẩm
  const productCategories: Array<{
    products: Product[];
    category: {
      name: string;
      url: string;
      title: string;
      ariaLabel: string;
    };
  }> = [
    {
      products: transformTablets,
      category: {
        name: 'Máy Tính Bảng',
        url: '/may-tinh-bang',
        title: 'Máy Tính Bảng - Giảm giá mạnh',
        ariaLabel: 'Xem thêm sản phẩm máy tính bảng',
      },
    },
    {
      products: transformMacbook,
      category: {
        name: 'Laptop Macbook',
        url: '/macbook',
        title: 'Macbook - Giảm giá mạnh',
        ariaLabel: 'Xem thêm sản phẩm laptop Macbook',
      },
    },
    {
      products: transformWindows,
      category: {
        name: 'Laptop Windows',
        url: '/windows',
        title: 'Windows - Giảm giá mạnh',
        ariaLabel: 'Xem thêm sản phẩm laptop Windows',
      },
    },
  ];

  return (
    <div className="w-full">
      <HeaderResponsive Title_NavbarMobile="7teck.vn" />
      <div className="pt-[60px] xl:pt-0">
        <Banner />
        <ZigzagSection />
        <ClientPhoneFC mostViewedPhones={mostViewedPhones} loading={loading} />
        {mostViewedPhones.length !== 0 && <BgFixedSection />}
        {productCategories.map((config, index) => (
          <div key={index} /* data-aos="fade-up" */ className="w-full">
            <ClientProductFC products={config.products} category={config.category} loading={loading} />
          </div>
        ))}
        <BenefitsSection />
        <ClientPostSection news={news} tricks={tricks} />
      </div>
    </div>
  );
}
