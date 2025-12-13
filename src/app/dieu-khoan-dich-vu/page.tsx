'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import HeaderResponsive from '@/components/userPage/ui/HeaderResponsive';
import { images } from '../../../public/images';
import { address, contact, hotlineUrl, mail, mailUrl } from '@/utils/socialLinks';

export default function TermsPage() {
  // Định nghĩa các biến style nhất quán theo tiêu chuẩn UI hiện đại, tối giản
  const accentColor = 'text-black'; // Màu nhấn
  const primaryTextColor = 'text-gray-900';
  const secondaryTextColor = 'text-gray-600';
  // Sử dụng cấu trúc tiêu đề mạnh mẽ, có viền dưới nhẹ
  const sectionTitleStyle = `text-2xl font-bold ${accentColor} mb-3 xl:text-3xl border-b border-gray-100 pb-2`;

  return (
    <div>
      <HeaderResponsive Title_NavbarMobile="7teck.vn" />
      <div className="py-[60px] xl:pt-0">
        {/* Breadcrumbs: Tối giản, sắc nét, có đủ aria-label */}
        <div className="breadcrumbs border-b border-gray-100 px-[10px] py-2 text-sm text-gray-500 xl:px-desktop-padding">
          <ul className="font-medium">
            <li>
              <Link aria-label="Trang chủ" href="/" className="transition-colors hover:text-black">
                Trang Chủ
              </Link>
            </li>
            <li>
              <span className="font-semibold text-black">Điều Khoản Dịch Vụ</span>
            </li>
          </ul>
        </div>

        <main className="min-h-screen w-full bg-white px-2 xl:px-desktop-padding">
          <div className="mx-auto max-w-5xl space-y-10 py-8 xl:py-12">
            {/* Header: Tiêu đề chuyên nghiệp */}
            <div className="flex flex-col items-center border-b border-gray-200 pb-6">
              <Image
                width={120}
                height={120}
                src={images.Logo}
                alt="7teck Logo"
                className="h-[100px] w-[100px] rounded-full border border-gray-200 object-contain p-1 md:h-[120px] md:w-[120px]"
                loading="lazy"
              />
              <h1 className={`mt-4 text-center text-3xl font-black uppercase ${primaryTextColor} xl:text-5xl`}>Điều Khoản Dịch Vụ</h1>
              <p className={`mt-2 text-center text-base ${secondaryTextColor}`}>
                Vui lòng đọc kỹ các điều khoản này trước khi sử dụng website và dịch vụ của 7teck.
              </p>
            </div>

            {/* Nội dung Điều khoản */}
            <article className="space-y-8 text-base leading-relaxed xl:space-y-10 xl:text-lg">
              <p className={`font-semibold ${primaryTextColor}`}>
                Bằng cách truy cập và sử dụng trang web **7teck.vn** (sau đây gọi là "Trang web"), bạn đồng ý chịu sự ràng buộc của các điều khoản và
                điều kiện dịch vụ này (sau đây gọi là "Điều khoản").
              </p>

              {/* --- 1. Chấp nhận Điều khoản --- */}
              <section>
                <h2 className={sectionTitleStyle}>1. Chấp Thuận Điều Khoản</h2>
                <p className={secondaryTextColor}>
                  Việc sử dụng Trang web đồng nghĩa với việc bạn xác nhận đã đọc, hiểu và đồng ý với tất cả các Điều khoản này. Nếu bạn không đồng ý
                  với bất kỳ Điều khoản nào, vui lòng không sử dụng Trang web.
                </p>
              </section>

              {/* --- 2. Dịch vụ cung cấp --- */}
              <section>
                <h2 className={sectionTitleStyle}>2. Dịch Vụ Cung Cấp và Điều Kiện Giao Dịch</h2>
                <ul className="list-disc space-y-2 pl-6 pt-2 text-gray-800">
                  <li>
                    <strong className={accentColor}>Mô tả Dịch vụ:</strong> 7teck.vn cung cấp các sản phẩm điện tử chính hãng như điện thoại, laptop,
                    và phụ kiện.
                  </li>
                  <li>
                    <strong className={accentColor}>Thông tin Sản phẩm:</strong> Chúng tôi cam kết cung cấp thông tin sản phẩm chính xác nhất. Tuy
                    nhiên, màu sắc và mô tả có thể có sự khác biệt nhỏ do cài đặt màn hình hoặc lỗi kỹ thuật.
                  </li>
                  <li>
                    <strong className={accentColor}>Giá cả:</strong> Giá sản phẩm có thể thay đổi mà không cần báo trước. Giá cuối cùng được áp dụng
                    là giá hiển thị tại thời điểm thanh toán.
                  </li>
                </ul>
              </section>

              {/* --- 3. Nghĩa vụ người dùng --- */}
              <section>
                <h2 className={sectionTitleStyle}>3. Nghĩa Vụ và Trách Nhiệm Của Người Dùng</h2>
                <ul className="list-disc space-y-2 pl-6 pt-2 text-gray-800">
                  <li>
                    <strong className={accentColor}>Thông tin Chính xác:</strong> Đảm bảo thông tin cá nhân (tên, địa chỉ, số điện thoại) cung cấp là
                    chính xác và đầy đủ khi thực hiện giao dịch.
                  </li>
                  <li>
                    <strong className={accentColor}>Sử dụng Hợp pháp:</strong> Người dùng cam kết không sử dụng dịch vụ hoặc Trang web với mục đích
                    bất hợp pháp, gian lận, spam, hoặc phá hoại hệ thống và cộng đồng.
                  </li>
                  <li>
                    <strong className={accentColor}>Bảo mật Tài khoản:</strong> Chịu trách nhiệm bảo mật thông tin đăng nhập và mật khẩu (nếu có).
                  </li>
                </ul>
              </section>

              {/* --- 4. Giới hạn trách nhiệm --- */}
              <section>
                <h2 className={sectionTitleStyle}>4. Giới Hạn Trách Nhiệm</h2>
                <ul className="list-disc space-y-2 pl-6 pt-2 text-gray-800">
                  <li>
                    <strong className={accentColor}>Trách nhiệm Bảo hành:</strong> Trách nhiệm bảo hành được thực hiện theo{' '}
                    <Link href="/chinh-sach-bao-hanh" className="font-semibold underline transition-colors hover:text-gray-700">
                      Chính Sách Bảo Hành
                    </Link>{' '}
                    riêng biệt của 7teck.
                  </li>
                  <li>
                    <strong className={accentColor}>Thiệt hại Gián tiếp:</strong> Chúng tôi không chịu trách nhiệm cho bất kỳ thiệt hại gián tiếp,
                    ngẫu nhiên hoặc hậu quả nào phát sinh từ việc sử dụng hoặc không thể sử dụng sản phẩm hoặc dịch vụ.
                  </li>
                  <li>
                    <strong className={accentColor}>Tính sẵn có:</strong> Chúng tôi không đảm bảo Trang web sẽ luôn sẵn có, không bị gián đoạn hoặc
                    không có lỗi.
                  </li>
                </ul>
              </section>

              {/* --- 5. Thay đổi Điều khoản --- */}
              <section>
                <h2 className={sectionTitleStyle}>5. Thay Đổi Điều Khoản</h2>
                <p className={secondaryTextColor}>
                  7teck có quyền cập nhật, thay đổi hoặc chỉnh sửa các Điều khoản này vào bất kỳ thời điểm nào mà không cần báo trước. Các thay đổi sẽ
                  có hiệu lực ngay khi được đăng tải trên Trang web. Việc bạn tiếp tục sử dụng Trang web sau khi Điều khoản được thay đổi đồng nghĩa
                  với việc bạn chấp nhận các Điều khoản đã được chỉnh sửa.
                </p>
              </section>
            </article>

            {/* --- Footer - Liên hệ --- */}
            <div className="mt-10 border-t border-gray-100 pt-8 text-center text-base">
              <h2 className={`mb-4 text-2xl font-bold ${accentColor} xl:text-3xl`}>Hỗ Trợ & Thắc Mắc</h2>
              <p className={`mb-4 ${secondaryTextColor}`}>
                Nếu quý khách có bất kỳ thắc mắc nào liên quan đến các Điều khoản dịch vụ này, vui lòng liên hệ:
              </p>

              <div className="flex flex-col items-center justify-center space-y-2 text-left xl:flex-row xl:space-x-8 xl:space-y-0">
                <p className="w-full xl:w-auto">
                  📞 <strong className={accentColor}>Hotline:</strong>
                  <a href={hotlineUrl} aria-label="Gọi hotline" className={`ml-2 font-semibold ${accentColor} transition-colors hover:text-gray-700`}>
                    {contact}
                  </a>
                </p>

                <p className="w-full xl:w-auto">
                  📧 <strong className={accentColor}>Email:</strong>
                  <a
                    href={mailUrl}
                    aria-label="Gửi email hỗ trợ"
                    className={`ml-2 font-semibold ${accentColor} transition-colors hover:text-gray-700`}
                  >
                    {mail}
                  </a>
                </p>

                <p className="w-full xl:w-auto">
                  🏢 <strong className={accentColor}>Địa chỉ:</strong>
                  <span className="ml-2">{address}</span>
                </p>
              </div>
            </div>

            <footer className="border-t border-gray-100 pt-4 text-center text-sm text-gray-500">
              <p>Phiên bản Điều khoản dịch vụ có hiệu lực từ ngày: **26/06/2025**.</p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
