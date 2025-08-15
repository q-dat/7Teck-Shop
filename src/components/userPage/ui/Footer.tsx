'use client';
import React from 'react';
import { Footer } from 'react-daisyui';
import { FaMapLocationDot } from 'react-icons/fa6';
import { FaFacebook, FaFacebookMessenger, FaPhone } from 'react-icons/fa';
import { IoMail } from 'react-icons/io5';
import { images } from '../../../../public/images';
import Link from 'next/link';
import { address, contact, copyright, fanpageUrl, ggMapUrl, hotlineUrl, mail, mailUrl, messengerUrl, zaloUrl } from '@/utils/socialLinks';
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
  <sup className="ml-1 rounded-full bg-red-700 px-1 py-0.5 text-[8px] font-semibold text-white shadow-md">{label}</sup>
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
      {/* Footer */}
      <Footer className="item-center grid grid-flow-row grid-cols-2 items-start justify-center bg-black px-2 pb-20 pt-10 text-white md:grid-cols-4 xl:flex-row xl:px-desktop-padding">
        {/* 1 */}
        <div className="w-full">
          <Footer.Title className="border-b-[1px] text-xs xl:text-sm">Danh Mục Sản Phẩm</Footer.Title>
          <div className="flex w-full flex-col gap-2 text-xs font-medium xl:text-sm">
            <Link className="hover:font-semibold hover:underline" href="/dien-thoai">
              Điện Thoại {Badge('NEW SEAL')}
            </Link>
            <Link className="hover:font-semibold hover:underline" href="/may-tinh-bang">
              Máy Tính Bảng {Badge('NEW SEAL')}
            </Link>
            <Link className="hover:font-semibold hover:underline" href="/macbook">
              Laptop Macbook {Badge('NEW SEAL')}
            </Link>
            <Link className="hover:font-semibold hover:underline" href="/windows">
              Laptop Windows {Badge('NEW SEAL')}
            </Link>
            <Link className="hover:font-semibold hover:underline" href="/thiet-bi-da-qua-su-dung">
              Thiết Bị Cũ
              <sup className="ml-1 rounded-full bg-yellow-400 px-1 py-0.5 text-[8px] font-semibold text-default shadow-md">USED</sup>
            </Link>
            <Link className="hover:font-semibold hover:underline" href="/bang-gia-thu-mua">
              Bảng Giá Thu Mua
            </Link>
          </div>
        </div>
        {/* 2 */}
        <div className="w-full">
          <Footer.Title className="border-b-[1px] text-xs xl:text-sm">Chính Sách Bán Hàng</Footer.Title>
          <div className="flex flex-col gap-2 text-xs font-medium xl:text-sm">
            <Link className="hover:font-semibold hover:underline" href="/chinh-sach-bao-hanh">
              Chính Sách Bảo Hành
            </Link>
            <Link className="hover:font-semibold hover:underline" href="/chinh-sach-quyen-rieng-tu">
              Chính Sách Quyền Riêng Tư
            </Link>
            <Link className="hover:font-semibold hover:underline" href="/dieu-khoan-dich-vu">
              Điều Khoản Dịch Vụ
            </Link>
          </div>
        </div>
        {/* 3 */}
        <div className="w-full">
          <Footer.Title className="border-b-[1px] text-xs xl:text-sm">Liên Hệ & Mua Hàng</Footer.Title>
          <div className="mb-2 flex flex-row items-center justify-center gap-5 text-3xl">
            {/* Facebook */}
            <Link title="Liên hệ qua Fanpage" target="_blank" href={fanpageUrl} className="rounded-full">
              <FaFacebook />
            </Link>
            {/* Messenger */}
            <Link title="Liên hệ qua Messenger" target="_blank" href={messengerUrl} className="rounded-full">
              <FaFacebookMessenger />
            </Link>
            {/* Zalo */}
            <Link
              title="Liên hệ qua Zalo"
              target="_blank"
              className="black rounded-full bg-white px-[2px] py-[6px] text-sm font-semibold text-black"
              href={zaloUrl}
            >
              Zalo
            </Link>
          </div>
          <div className="flex flex-col gap-2 text-xs font-medium xl:text-sm">
            {/* Hotline */}
            <Link
              title="Liên hệ qua Hotline"
              target="_blank"
              className="flex items-center gap-2 font-medium hover:font-semibold hover:underline"
              href={hotlineUrl}
            >
              <FaPhone /> {contact}
            </Link>
            {/* Mail */}
            <Link
              title="Liên hệ qua Email"
              target="_blank"
              className="flex items-center gap-2 font-medium hover:font-semibold hover:underline"
              href={mailUrl}
            >
              <IoMail /> {mail}
            </Link>
            {/* Address */}
            <Link title="Địa chỉ" target="_blank" className="flex items-center gap-2 font-medium hover:font-semibold hover:underline" href={ggMapUrl}>
              <FaMapLocationDot className="text-xl" />
              {address}
            </Link>
          </div>
        </div>
        {/* Logo */}
        <div className="w-full text-xs leading-relaxed text-white xl:text-sm">
          <p className="text-white">
            <Image
              loading="lazy"
              src={images.Logo}
              alt="LOGO"
              width={100}
              height={100}
              className="float-left mr-2 h-[100px] w-[100px] object-contain"
            />
            <i>
              7Teck là đơn vị chuyên cung cấp các sản phẩm công nghệ chính hãng, từ điện thoại, máy tính bảng đến laptop và phụ kiện. Chúng tôi cam
              kết mang đến trải nghiệm mua sắm nhanh chóng, uy tín cùng dịch vụ hậu mãi chuyên nghiệp.
            </i>
          </p>
        </div>
      </Footer>
      <div className="border-t-[1px] border-gray-600 bg-black py-2 text-center text-xs text-white">
        {copyright}
        {/* Designed & developed by Điểu Quốc Đạt. */}
      </div>
    </div>
  );
}
