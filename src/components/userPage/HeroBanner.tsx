import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { images } from '../../../public/images';
import { IoShieldCheckmarkOutline } from 'react-icons/io5';

// Thành phần Banner
export default function HeroBanner() {
  return (
    <div className="relative block xl:hidden">
      {/* <div className="absolute bottom-0 left-0 top-0 h-full w-full bg-black bg-opacity-10 pl-2 pt-[20%] md:pl-20 md:pt-5 xl:pl-[100px] xl:pt-[4%]">
      <h1 className="text-[25px] font-extrabold text-white xl:text-[40px]">
        Đổi Điện Thoại Cũ, <br />
        Nhận Ngay Giá Tốt Nhất!
        </h1>
        <h2 className="w-[120px] bg-gradient-to-r from-primary via-primary to-transparent text-start text-[20px] font-thin italic text-white">
        up to 90%
      </h2>
    </div> */}
      <div className="absolute inset-0 flex flex-col justify-end gap-4 bg-gradient-to-tr from-primary/30 to-default/50 px-2 pb-5 xl:px-desktop-padding">
        {/* Tagline */}
        <span className="relative inline-block w-fit text-sm font-semibold uppercase tracking-wider text-white md:text-base">
          Ưu đãi trao đổi
          <span className="absolute -bottom-1 left-0 h-[2px] w-8 rounded-full bg-yellow-300"></span>
        </span>
        {/* Tiêu đề và mô tả */}
        <div className="w-full">
          <h1 className="text-2xl font-extrabold leading-snug text-white drop-shadow-md 2xl:text-3xl">
            <span className="inline-flex items-center justify-center gap-2">
              Thu Cũ Đổi Mới
              <IoShieldCheckmarkOutline className="text-green-400" />
            </span>
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
  );
}
