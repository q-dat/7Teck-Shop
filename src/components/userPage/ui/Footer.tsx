'use client';
import React from 'react';
import { Footer } from 'react-daisyui';
import { FaMapLocationDot } from 'react-icons/fa6';
import { FaFacebook, FaFacebookMessenger, FaPhone } from 'react-icons/fa';
import { IoMail } from 'react-icons/io5';
import { images } from '../../../../public/images';
import Link from 'next/link';
import { address, contact, copyright, fanpageUrl, hotlineUrl, mail, mailUrl, messengerUrl, zaloUrl } from '@/utils/socialLinks';
import Image from 'next/image';

const suggestedProducts = [
  { name: 'iPhone 16 Pro Max 1TB', url: 'https://www.7teck.vn/dien-thoai/iphone-16-pro-max-1tb' },
  { name: 'iPhone 16 Pro Max 256GB', url: 'https://www.7teck.vn/dien-thoai/iphone-16-pro-max-256gb' },
  { name: 'iPhone 15 Pro Max 256GB', url: 'https://www.7teck.vn/dien-thoai/iphone-15-promax-256gb' },
  { name: 'iPhone 14 Plus 256GB', url: 'https://www.7teck.vn/dien-thoai/iphone-14-plus-256gb' },
  { name: 'iPad Gen 10 64GB WiFi', url: 'https://www.7teck.vn/may-tinh-bang/ipad-gen-10-64gb-wifi' },
  { name: 'iPad Air 4 256GB', url: 'https://www.7teck.vn/may-tinh-bang/ipad-air-4-256gb' },
  { name: 'iPad Air 4 64GB', url: 'https://www.7teck.vn/may-tinh-bang/ipad-air-4-64gb' },
  { name: 'Dell Latitude 7420 Core i7', url: 'https://www.7teck.vn/windows/dell-latitude-7420-core-i7-gen-11-16gb-256gb' },
  { name: 'Dell Latitude 7310 2-in-1', url: 'https://www.7teck.vn/windows/dell-latitude-7310-2-in-1-ban-13-3-inch-intel-i7-32gb-512gb' },
  { name: 'Dell XPS 9315 i5', url: 'https://www.7teck.vn/windows/dell-xps-9315-intel-i5-8gb-256gb-ban-14inch' },
];
const Badge = (label: string) => (
  <sup className="ml-1 rounded-full bg-red-700 px-1 py-0.5 text-[10px] font-semibold uppercase text-white shadow-md">{label}</sup>
);

export default function FooterFC() {
  return (
    <div className="mb-[50px] xl:mb-0">
      {/* Suggest */}
      <div className="w-full px-2 py-4 xl:px-desktop-padding" role="region" aria-label="Sản phẩm gợi ý">
        <span className="font-semibold">Sản phẩm gợi ý:</span>
        <br />
        <div className="flex w-full flex-wrap gap-2 rounded-md bg-white p-2 text-sm text-black shadow">
          {suggestedProducts.map((product, index) => (
            <Link
              key={index}
              href={product.url}
              className="max-w-[200px] rounded-md bg-[#f3f3f3] p-2 text-xs focus:outline-none hover:underline"
              aria-label={`Xem sản phẩm: ${product.name}`}
            >
              <span className="block overflow-hidden text-ellipsis whitespace-nowrap">{product.name}</span>
            </Link>
          ))}
        </div>
      </div>

      <Footer className="item-center flex flex-col justify-between bg-black px-2 pb-0 pt-10 text-white xl:flex-row xl:px-desktop-padding xl:pb-10">
        {/* Logo */}
        <div className="w-full">
          <Image loading="lazy" src={images.Logo} alt="LOGO" width={140} height={60} className="rounded-full border border-white object-contain" />
        </div>
        {/* 1 */}
        <div className="w-full">
          <Footer.Title className="border-b-[1px]">Thông Tin</Footer.Title>
          <Link className="font-medium hover:font-semibold" href="/dien-thoai">
            Điện Thoại {Badge('NEW SEAL')}
          </Link>
          <Link className="font-medium hover:font-semibold" href="/may-tinh-bang">
            Máy Tính Bảng {Badge('NEW SEAL')}
          </Link>
          <Link className="font-medium hover:font-semibold" href="/macbook">
            Laptop Macbook {Badge('NEW SEAL')}
          </Link>
          <Link className="font-medium hover:font-semibold" href="/windows">
            Laptop Windows {Badge('NEW SEAL')}
          </Link>
          <Link className="font-medium hover:font-semibold" href="/thiet-bi-da-qua-su-dung">
            Thiết Bị Đã Qua Sử Dụng
            <sup className="ml-1 rounded-full bg-orange-700 px-1 py-0.5 text-[10px] font-semibold uppercase text-black shadow-md">USED</sup>
          </Link>

          <Link className="font-medium hover:font-semibold" href="/bang-gia-thu-mua">
            Bảng Giá Thu Mua
          </Link>
        </div>
        {/* 2 */}
        <div className="w-full">
          <Footer.Title className="border-b-[1px]">Chính Sách Bán Hàng</Footer.Title>
          <Link className="font-medium hover:font-semibold" href="/chinh-sach-bao-hanh">
            Chính Sách Bảo Hành
          </Link>
          <Link className="font-medium hover:font-semibold" href="/chinh-sach-quyen-rieng-tu">
            Chính Sách Quyền Riêng Tư
          </Link>
          <Link className="font-medium hover:font-semibold" href="/dieu-khoan-dich-vu">
            Điều Khoản Dịch Vụ
          </Link>
        </div>
        {/* 3 */}
        <div className="w-full">
          <Footer.Title className="border-b-[1px]">Liên Hệ & Mua Hàng</Footer.Title>
          <div className="mb-2 flex flex-row items-center justify-center gap-5 text-3xl">
            <Link title="Liên hệ qua Fanpage" target="_blank" href={fanpageUrl} className="rounded-full">
              <FaFacebook />
            </Link>
            <Link title="Liên hệ qua Messenger" target="_blank" href={messengerUrl} className="rounded-full">
              <FaFacebookMessenger />
            </Link>
            <Link
              title="Liên hệ qua Zalo"
              target="_blank"
              className="black rounded-full bg-white px-[2px] py-[6px] text-sm font-semibold text-black"
              href={zaloUrl}
            >
              Zalo
            </Link>
          </div>
          <Link title="Liên hệ qua Hotline" className="flex items-center gap-2 font-medium hover:font-semibold" href={hotlineUrl}>
            <FaPhone /> {contact}
          </Link>
          <Link target="_blank" className="flex items-center gap-2 font-medium hover:font-semibold" href={mailUrl}>
            <IoMail /> {mail}
          </Link>
        </div>
        {/* 4 */}
        <div className="w-full">
          <Footer.Title className="border-b-[1px]">Địa chỉ</Footer.Title>
          <div className="flex w-full flex-col gap-2 font-medium">
            <p className="flex items-start gap-2">
              <FaMapLocationDot className="text-xl" />
              {address}
            </p>
          </div>
        </div>
      </Footer>
      <div className="border-t-[1px] border-gray-600 bg-black py-2 text-center text-white">
        {copyright}
        {/* Designed & developed by Điểu Quốc Đạt. */}
      </div>
    </div>
  );
}
