'use client';
import HeaderResponsive from '@/components/userPage/HeaderResponsive';
import { memo, useEffect, useState } from 'react';
import ClientPhoneFC from './ClientPhoneFC';
import ClientProductFC, { Product } from './ClientProductFC';
import ClientPostSection from './ClientPostSection';
import { IMacbook } from '@/types/type/products/macbook/macbook';
import { IPost } from '@/types/type/products/post/post';
import Image from 'next/image';
import { images } from '../../public/images';
import { IPhone } from '@/types/type/products/phone/phone';
import { ITablet } from '@/types/type/products/tablet/tablet';
import { IWindows } from '@/types/type/products/windows/windows';

// Thành phần Banner
const BannerComponent = memo(() => (
  <div className="relative">
    <div className="absolute bottom-0 left-0 top-0 h-full w-full bg-black bg-opacity-10 pl-2 pt-[20%] md:pl-20 md:pt-5 xl:pl-[100px] xl:pt-[4%]">
      <h1 className="text-[25px] font-extrabold text-white xl:text-[40px]">
        Đổi Điện Thoại Cũ, <br />
        Nhận Ngay Giá Tốt Nhất!
      </h1>
      <h2 className="w-[120px] bg-gradient-to-r from-primary via-primary to-transparent text-start text-[20px] font-thin italic text-white">
        up to 90%
      </h2>
    </div>
    <picture className="h-full w-full">
      <source srcSet={`${images.BannerDesktop}`} media="(min-width: 1024px)" />
      <source srcSet={`${images.BannerTablet}`} media="(min-width: 601px)" />
      <Image height={100} width={100} src={`${images.BannerMobile}`} alt="Banner" className="h-full w-full object-cover" loading="eager" />
    </picture>
  </div>
));
BannerComponent.displayName = 'BannerComponent';
const Banner = memo(BannerComponent);

// Thành phần Background Fixed
const BgFixedSectionComponent = memo(() => (
  <div
    className="relative my-10 h-[200px] w-full bg-cover bg-fixed bg-center bg-no-repeat xl:h-[300px]"
    style={{
      backgroundImage: `url(${images.bgFixed})`,
    }}
  >
    <div className="absolute left-1/2 top-1/2 flex h-full w-full -translate-x-1/2 -translate-y-1/2 transform flex-col items-center justify-center bg-black bg-opacity-30 px-2 text-lg font-light text-white xl:px-desktop-padding xl:text-3xl">
      <h2 className="font-semibold" uk-parallax="opacity: 0,9; y: -50,0; scale: 2,1; end: 50vh + 50%;">
        iPhone 16 Pro Max
      </h2>
      <i className="text-center" uk-parallax="opacity: 0,9; y: 50,0; scale: 0.5,1; end: 50vh + 50%;">
        Trải nghiệm công nghệ đỉnh cao với thiết kế mới mẻ, hiệu suất vượt trội và camera siêu nét.
      </i>
    </div>
  </div>
));
BgFixedSectionComponent.displayName = 'BgFixedSectionComponent';
const BgFixedSection = memo(BgFixedSectionComponent);

interface ClientHomePageProps {
  mostViewedPhones: IPhone[];
  macbook: IMacbook[];
  tablets: ITablet[];
  windows: IWindows[];
  posts: IPost[];
}

export default function ClientHomePage({ mostViewedPhones, tablets, macbook, windows, posts }: ClientHomePageProps) {
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
        name: 'Macbook',
        url: '/macbook',
        title: 'Macbook - Giảm giá mạnh',
        ariaLabel: 'Xem thêm sản phẩm laptop Macbook',
      },
    },
    {
      products: transformWindows,
      category: {
        name: 'Windows',
        url: '/windows',
        title: 'Windows - Giảm giá mạnh',
        ariaLabel: 'Xem thêm sản phẩm laptop Windows',
      },
    },
  ];

  return (
    <div>
      {/* Thanh điều hướng responsive */}
      <HeaderResponsive Title_NavbarMobile="Trang Chủ" />
      <div className="pt-[60px] xl:pt-0">
        {/* Banner quảng cáo */}
        <Banner />
        {/* Phần lợi ích */}
        {/* <BenefitsSection /> */}
        {/* Phần sản phẩm điện thoại */}
        {/* <div data-aos="fade-down"> */}
        <ClientPhoneFC mostViewedPhones={mostViewedPhones} loading={loading} />
        {/* </div> */}
        {/* Phần nền cố định */}
        {mostViewedPhones.length !== 0 && <BgFixedSection />}
        {/* Phần sản phẩm giảm giá */}
        <div className="flex w-full flex-col items-center justify-center gap-5">
          {productCategories.map((config, index) => (
            <div key={index} /* data-aos="fade-up" */ className="w-full">
              <ClientProductFC products={config.products} category={config.category} loading={loading} />
            </div>
          ))}
        </div>
        {/* Phần bài viết */}
        <ClientPostSection posts={posts} />
      </div>
    </div>
  );
}
