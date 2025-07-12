'use client';
import React from 'react';
import Image from 'next/image';
import { images } from '../../../public/images';
import { address, contact, hotlineUrl, mail, mailUrl } from '@/utils/socialLinks';
import HeaderResponsive from '@/components/userPage/HeaderResponsive';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div>
      <HeaderResponsive Title_NavbarMobile="7teck.vn" />
      <div className="py-[60px] xl:pt-0">
        <div className="breadcrumbs px-[10px] py-2 text-sm text-black shadow xl:px-desktop-padding">
          <ul className="font-light">
            <li>
              <Link href="/">Trang Chủ</Link>
            </li>
            <li>
              <Link href="chinh-sach-quyen-rieng-tu">Điều Khoản Dịch Vụ</Link>
            </li>
          </ul>
        </div>{' '}
        <main className="min-h-screen w-full bg-white px-2 text-black">
          <div className="mx-auto max-w-5xl space-y-10">
            <div className="flex flex-col items-center">
              <Image
                width={160}
                height={160}
                src={images.Logo}
                alt="7teck Logo"
                className="h-[120px] w-[120px] rounded-full object-contain md:h-[160px] md:w-[160px]"
                loading="lazy"
              />
              <h1 className="mt-6 text-center text-4xl font-bold uppercase text-[#a92d30]">Điều khoản dịch vụ</h1>
            </div>
            <section className="space-y-6 text-lg leading-relaxed">
              <p>Bằng cách truy cập và sử dụng trang web 7teck.vn, bạn đồng ý với các điều khoản được mô tả dưới đây.</p>

              <div>
                <h2 className="mb-2 text-2xl font-semibold text-[#a92d30]">1. Dịch vụ cung cấp</h2>
                <p>7teck.vn cung cấp các sản phẩm điện tử chính hãng như điện thoại, laptop, phụ kiện với chính sách bảo hành rõ ràng.</p>
              </div>

              <div>
                <h2 className="mb-2 text-2xl font-semibold text-[#a92d30]">2. Nghĩa vụ người dùng</h2>
                <p>Người dùng không được sử dụng dịch vụ với mục đích gian lận, spam, hoặc phá hoại hệ thống và cộng đồng.</p>
              </div>

              <div>
                <h2 className="mb-2 text-2xl font-semibold text-[#a92d30]">3. Giới hạn trách nhiệm</h2>
                <p>Chúng tôi không chịu trách nhiệm cho những thiệt hại gián tiếp phát sinh từ việc sử dụng sản phẩm hoặc dịch vụ.</p>
              </div>
            </section>
            {/* Footer - Liên hệ */}
            <div className="mt-10 border-t border-gray-200 pt-8 text-center text-base">
              <h2 className="mb-4 text-2xl font-semibold text-[#a92d30]">Liên hệ với chúng tôi</h2>
              <p className="mb-2">Nếu quý khách có thắc mắc về nội dung Điều khoản dịch vụ, vui lòng liên hệ:</p>
              <p className="mb-1">
                📞 <strong>Hotline:</strong>
                <a href={hotlineUrl} className="text-[#a92d30]">
                  {contact}
                </a>
              </p>
              <p className="mb-1">
                📧 <strong>Email:</strong>
                <a href={mailUrl} className="text-[#a92d30]">
                  {mail}
                </a>
              </p>
              <p>
                🏢 <strong>Địa chỉ:</strong> {address}
              </p>
            </div>
            <footer className="text-center text-sm text-gray-500">Cập nhật lần cuối: 26/06/2025</footer>
          </div>
        </main>
      </div>
    </div>
  );
}
