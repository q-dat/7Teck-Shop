'use client';

import HeaderResponsive from '@/components/userPage/ui/HeaderResponsive';
import { hotlineUrl, mailUrl, ggMapUrl, address, messengerUrl, zaloUrl, fanpageUrl } from '@/utils/socialLinks';
import Link from 'next/link';
import Image from 'next/image';

export default function ContactPage() {
  return (
    <div>
      <HeaderResponsive Title_NavbarMobile="7teck.vn" />
      <div className="py-[60px] xl:pt-0">
        {/* breadcrumbs */}
        <div className="breadcrumbs bg-primary-lighter px-[10px] py-2 text-sm text-black shadow xl:px-desktop-padding">
          <ul className="font-light">
            <li>
              <Link role="navigation" aria-label="Trang chủ" href="/" className="text-primary hover:underline">
                Trang Chủ
              </Link>
            </li>
            <li>
              <span className="text-black">Liên Hệ</span>
            </li>
          </ul>
        </div>

        {/* Nội dung UI - Thêm sections và hình ảnh */}
        <div className="px-[10px] py-6 xl:px-desktop-padding">
          {/* Section 1: Giới thiệu liên hệ */}
          <div className="rounded-xl bg-white p-6 shadow-md md:p-10">
            <h1 className="mb-4 text-2xl font-bold text-primary md:text-3xl">Liên Hệ Với 7Teck</h1>
            <p className="mb-6 text-gray-700">Đội ngũ của chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7. Hãy chọn kênh liên lạc thuận tiện nhất:</p>

            <ul className="space-y-3 text-gray-800">
              <li>
                📞 Hotline:{' '}
                <a href={hotlineUrl} className="font-semibold text-primary hover:underline">
                  0333 133 050
                </a>
              </li>
              <li>
                📧 Email:{' '}
                <a href={mailUrl} className="font-semibold text-primary hover:underline">
                  cskh.7teck@gmail.com
                </a>
              </li>
              <li>
                📍 Địa chỉ:{' '}
                <a href={ggMapUrl} target="_blank" className="font-semibold text-primary hover:underline">
                  {address}
                </a>
              </li>
              <li>
                💬 Messenger:{' '}
                <a href={messengerUrl} target="_blank" className="text-primary hover:underline">
                  Chat ngay
                </a>
              </li>
              <li>
                💬 Zalo:{' '}
                <a href={zaloUrl} target="_blank" className="text-primary hover:underline">
                  Zalo 0333 133 050
                </a>
              </li>
              <li>
                💬 Fanpage:{' '}
                <a href={fanpageUrl} target="_blank" className="text-primary hover:underline">
                  facebook.com/7teck.vn
                </a>
              </li>
            </ul>

            {/* Hình ảnh minh họa */}
            <div className="mt-6 flex justify-center">
              <Image
                src="https://source.unsplash.com/random/800x400/?contact,team"
                alt="Đội ngũ liên hệ"
                width={800}
                height={400}
                className="rounded-lg shadow-md"
              />
            </div>

            {/* CTA */}
            <div className="mt-6">
              <a
                href={messengerUrl}
                target="_blank"
                className="rounded-lg bg-primary px-6 py-3 font-semibold text-white shadow-md transition hover:bg-secondary"
              >
                Liên Hệ Ngay
              </a>
            </div>
          </div>

          {/* Section 2: Bản đồ địa chỉ */}
          <div className="mt-10 rounded-xl bg-white p-6 shadow-md md:p-10">
            <h2 className="mb-4 text-xl font-bold text-primary md:text-2xl">Vị Trí Cửa Hàng</h2>
            <p className="mb-4 text-gray-700">Ghé thăm chúng tôi tại địa chỉ: {address}</p>
            <div className="flex justify-center">
              <iframe
                src={ggMapUrl}
                width="100%"
                height="400"
                className="rounded-lg"
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>

          {/* Section 3: Form liên hệ */}
          <div className="mt-10 rounded-xl bg-white p-6 shadow-md md:p-10">
            <h2 className="mb-4 text-xl font-bold text-primary md:text-2xl">Gửi Tin Nhắn Cho Chúng Tôi</h2>
            <form className="space-y-4">
              <input type="text" placeholder="Tên của bạn" className="w-full rounded-lg border p-3" />
              <input type="email" placeholder="Email" className="w-full rounded-lg border p-3" />
              <textarea placeholder="Tin nhắn" className="w-full rounded-lg border p-3" rows={4} />
              <button type="submit" className="rounded-lg bg-primary px-6 py-3 font-semibold text-white shadow-md transition hover:bg-secondary">
                Gửi
              </button>
            </form>
          </div>

          {/* Section 4: Mạng xã hội */}
          <div className="mt-10 rounded-xl bg-white p-6 shadow-md md:p-10">
            <h2 className="mb-4 text-xl font-bold text-primary md:text-2xl">Kết Nối Với Chúng Tôi</h2>
            <div className="flex justify-center space-x-6">
              <a href={fanpageUrl} target="_blank">
                <Image src="https://source.unsplash.com/random/40x40/?facebook,icon" alt="Facebook" width={40} height={40} />
              </a>
              <a href={zaloUrl} target="_blank">
                <Image src="https://source.unsplash.com/random/40x40/?zalo,icon" alt="Zalo" width={40} height={40} />
              </a>
              <a href={messengerUrl} target="_blank">
                <Image src="https://source.unsplash.com/random/40x40/?messenger,icon" alt="Messenger" width={40} height={40} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}