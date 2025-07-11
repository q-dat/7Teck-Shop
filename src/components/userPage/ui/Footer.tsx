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

export default function FooterFC() {
  return (
    <div className="mb-[50px] xl:mb-0">
      <Footer className="item-center flex flex-col justify-between bg-black px-2 pb-0 pt-10 text-white xl:flex-row xl:px-desktop-padding xl:pb-10">
        {/* Logo */}
        <div className="w-full">
          <Image loading="lazy" src={images.Logo} alt="LOGO" width={140} height={60} className="rounded-full border border-white object-contain" />
        </div>
        {/* 1 */}
        <div className="w-full">
          <Footer.Title className="border-b-[1px]">Thông Tin</Footer.Title>
          <Link className="font-light hover:font-semibold" href="/dien-thoai">
            Điện Thoại
          </Link>
          <Link className="font-light hover:font-semibold" href="/may-tinh-bang">
            Máy Tính Bảng
          </Link>
          <Link className="font-light hover:font-semibold" href="/windows">
            Laptop Windows
          </Link>
          <Link className="font-light hover:font-semibold" href="/macbook">
            Laptop Macbook
          </Link>
          <Link className="font-light hover:font-semibold" href="/bang-gia-thu-mua">
            Bảng Giá Thu Mua
          </Link>
        </div>
        {/* 2 */}
        <div className="w-full">
          <Footer.Title className="border-b-[1px]">Chính Sách Bán Hàng</Footer.Title>
          <Link className="font-light hover:font-semibold" href="/chinh-sach-bao-hanh">
            Chính Sách Bảo Hành
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
          <Link title="Liên hệ qua Hotline" className="flex items-center gap-2 font-light hover:font-semibold" href={hotlineUrl}>
            <FaPhone /> {contact}
          </Link>
          <Link target="_blank" className="flex items-center gap-2 font-light hover:font-semibold" href={mailUrl}>
            <IoMail /> {mail}
          </Link>
        </div>
        {/* 4 */}
        <div className="w-full">
          <Footer.Title className="border-b-[1px]">Địa chỉ</Footer.Title>
          <div className="flex w-full flex-col gap-2 font-light">
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
