'use client';
import Image from 'next/image';
import Link from 'next/link';
import { FaMapLocationDot } from 'react-icons/fa6';
import { FaFacebook, FaFacebookMessenger, FaPhone } from 'react-icons/fa';
import { IoMail } from 'react-icons/io5';
import { images } from '../../../../public';

const FooterFC = () => {
  return (
    <div className="mb-[50px] xl:mb-0">
      <footer className="flex flex-col justify-between gap-10 bg-black px-2 pb-0 pt-10 text-white xl:flex-row xl:px-desktop-padding xl:pb-10">
        {/* Logo */}
        <div className="w-full">
          <Image width={140} height={140} loading="lazy" src={images.Logo} alt="LOGO" className="rounded-full border border-white" />
        </div>

        {/* Thông tin */}
        <div className="w-full">
          <h3 className="mb-2 border-b-[1px] text-lg font-semibold">Thông Tin</h3>
          <ul className="flex flex-col gap-1">
            <li>
              <Link href="/iphone" className="font-light hover:font-semibold">
                Điện Thoại IPhone
              </Link>
            </li>
            <li>
              <Link href="/ipad" className="font-light hover:font-semibold">
                iPad/ Máy Tính Bảng
              </Link>
            </li>
            <li>
              <Link href="/windows" className="font-light hover:font-semibold">
                Laptop Windows
              </Link>
            </li>
            <li>
              <Link href="/macbook" className="font-light hover:font-semibold">
                Laptop Macbook
              </Link>
            </li>
            <li>
              <Link href="/bang-gia-thu-mua" className="font-light hover:font-semibold">
                Bảng Giá Thu Mua
              </Link>
            </li>
          </ul>
        </div>

        {/* Chính sách */}
        <div className="w-full">
          <h3 className="mb-2 border-b-[1px] text-lg font-semibold">Chính Sách Bán Hàng</h3>
          <ul className="flex flex-col gap-1">
            <li>
              <Link href="/chinh-sach-bao-hanh" className="font-light hover:font-semibold">
                Chính Sách Bảo Hành
              </Link>
            </li>
          </ul>
        </div>

        {/* Liên hệ */}
        <div className="w-full">
          <h3 className="mb-2 border-b-[1px] text-lg font-semibold">Liên Hệ & Mua Hàng</h3>
          <div className="mb-2 flex gap-5 text-3xl">
            <Link href="https://www.facebook.com/7teck.vn" target="_blank" title="Fanpage">
              <FaFacebook />
            </Link>
            <Link href="https://www.messenger.com/t/dangkhoa.pham.93" target="_blank" title="Messenger">
              <FaFacebookMessenger />
            </Link>
            <Link
              href="https://zalo.me/0983699993"
              target="_blank"
              title="Zalo"
              className="rounded-full bg-white px-2 py-1 text-sm font-semibold text-black"
            >
              Zalo
            </Link>
          </div>
          <Link href="tel:0983699993" className="flex items-center gap-2 font-light hover:font-semibold">
            <FaPhone /> (+84) 983.699.993 (Khoa)
          </Link>
          <Link href="mailto:cskh.7teck@gmail.com" className="flex items-center gap-2 font-light hover:font-semibold">
            <IoMail /> cskh.7teck@gmail.com
          </Link>
        </div>

        {/* Địa chỉ */}
        <div className="w-full">
          <h3 className="mb-2 border-b-[1px] text-lg font-semibold">Địa chỉ</h3>
          <p className="flex items-start gap-2 font-light">
            <FaMapLocationDot className="text-xl" />
            136/11 Trần Quang Diệu, Phường 12, Quận 3, HCM
          </p>
        </div>
      </footer>

      <div className="border-t border-gray-600 bg-black py-2 text-center text-sm text-white">Copyright © 2024 7Teck</div>
    </div>
  );
};

export default FooterFC;
