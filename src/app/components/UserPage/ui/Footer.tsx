import React from 'react';
import { FaMapLocationDot } from 'react-icons/fa6';
import { FaFacebook, FaFacebookMessenger, FaPhone } from 'react-icons/fa';
import { IoMail } from 'react-icons/io5';
import { images } from '../../../../../public/images';
import Link from 'next/link';
import Image from 'next/image';

const FooterTitle: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div>
      <p className="mb-2 inline-block border-b border-gray-400 font-bold uppercase text-gray-400"> {title}</p>
    </div>
  );
};

const FooterFC: React.FC = () => {
  return (
    <div className="mb-[50px] xl:mb-0">
      <footer className="item-center flex flex-col justify-between bg-black px-2 pb-0 pt-10 text-white xl:flex-row xl:px-desktop-padding xl:pb-10">
        {/* Logo */}
        <div className="flex w-full flex-col gap-2 text-sm">
          <Image src={images.Logo} width={140} height={140} alt="LOGO" className="h-[140px] w-[140px] rounded-full border border-white" />
        </div>
        {/* 1 */}
        <div className="flex w-full flex-col gap-2 text-sm">
          <FooterTitle title="Thông tin" />
          <Link className="font-light hover:font-semibold" href="/iphone">
            Điện Thoại IPhone
          </Link>
          <Link className="font-light hover:font-semibold" href="/ipad">
            iPad/ Máy Tính Bảng
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
        <div className="flex w-full flex-col gap-2 text-sm">
          <FooterTitle title="Chính Sách Bán Hàng" />
          <Link className="font-light hover:font-semibold" href="/chinh-sach-bao-hanh">
            Chính Sách Bảo Hành
          </Link>
        </div>
        {/* 3 */}
        <div className="flex w-full flex-col gap-2 text-sm">
          <FooterTitle title="Liên Hệ & Mua Hàng" />
          <div className="mb-2 flex flex-row items-center justify-start gap-5 text-3xl">
            <Link title="Liên hệ qua Fanpage" target="_blank" href={'https://www.facebook.com/7teck.vn'} className="rounded-full">
              <FaFacebook />
            </Link>
            <Link title="Liên hệ qua Messenger" target="_blank" href={'https://www.messenger.com/t/dangkhoa.pham.93'} className="rounded-full">
              <FaFacebookMessenger />
            </Link>
            <Link
              title="Liên hệ qua Zalo"
              target="_blank"
              className="black rounded-full bg-white px-[2px] py-[6px] text-sm font-semibold text-black"
              href={'https://zalo.me/0983699993'}
            >
              Zalo
            </Link>
          </div>
          <Link title="Liên hệ qua Hotline" className="flex items-center gap-2 font-light hover:font-semibold" href="tel:0983699993">
            <FaPhone /> (+84) 983.699.993 (Khoa)
          </Link>
          <Link target="_blank" className="flex items-center gap-2 font-light hover:font-semibold" href="mailto:cskh.7teck@gmail.com">
            <IoMail /> cskh.7teck@gmail.com
          </Link>
        </div>
        {/* 4 */}
        <div className="flex w-full flex-col gap-2 text-sm">
          <FooterTitle title="Địa Chỉ" />
          <div className="flex w-full flex-col gap-2 font-light">
            <p className="flex items-start gap-2">
              <FaMapLocationDot className="text-xl" />
              136/11 Trần Quang Diệu, Phường 12, Quận 3, HCM
            </p>
          </div>
        </div>
      </footer>
      <div className="border-t-[1px] border-gray-600 bg-black py-2 text-center text-white">
        Copyright © 2024 7Teck
        {/* Designed & developed by Điểu Quốc Đạt. */}
      </div>
    </div>
  );
};

export default FooterFC;
