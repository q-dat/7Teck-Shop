'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import HeaderResponsive from '@/components/userPage/ui/HeaderResponsive';
import { images } from '../../../public/images';
import { address, contact, hotlineUrl, mail, mailUrl } from '@/utils/socialLinks';

export default function PrivacyPage() {
  // Định nghĩa các biến style nhất quán theo tiêu chuẩn UI hiện đại, tối giản
  const accentColor = 'text-black'; // Màu nhấn
  const primaryTextColor = 'text-gray-900';
  const secondaryTextColor = 'text-gray-600';
  const sectionTitleStyle = `text-2xl font-bold ${accentColor} mb-3 xl:text-3xl border-b border-gray-100 pb-2`;

  return (
    <div>
      <HeaderResponsive Title_NavbarMobile="7teck.vn" />
      <div className="py-[60px] xl:pt-0">
        {/* Breadcrumbs: Tối giản, sắc nét */}
        <div className="breadcrumbs border-b border-gray-100 px-[10px] py-2 text-sm text-gray-500 xl:px-desktop-padding">
          <ul className="font-medium">
            <li>
              <Link aria-label="Trang chủ" href="/" className="transition-colors hover:text-black">
                Trang Chủ
              </Link>
            </li>
            <li>
              <span className="font-semibold text-black">Chính Sách Quyền Riêng Tư</span>
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
              <h1 className={`mt-4 text-center text-3xl font-black uppercase ${primaryTextColor} xl:text-5xl`}>Chính Sách Quyền Riêng Tư</h1>
              <p className={`mt-2 text-center text-base ${secondaryTextColor}`}>
                Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn với mức độ ưu tiên cao nhất.
              </p>
            </div>

            {/* Nội dung Chính sách */}
            <article className="space-y-8 text-base leading-relaxed xl:space-y-10 xl:text-lg">
              <p className={`font-semibold ${primaryTextColor}`}>
                **7teck** cam kết bảo vệ quyền riêng tư và thông tin cá nhân của khách hàng khi truy cập và sử dụng dịch vụ tại website **7teck.vn**.
              </p>

              {/* --- 1. Dữ liệu được thu thập --- */}
              <section>
                <h2 className={sectionTitleStyle}>1. Loại Dữ Liệu Được Thu Thập</h2>
                <p className={secondaryTextColor}>
                  Chúng tôi thu thập các loại thông tin cá nhân sau đây khi quý khách đặt hàng hoặc đăng ký nhận thông tin:
                </p>
                <ul className="list-disc space-y-2 pl-6 pt-2 text-gray-800">
                  <li>
                    <strong className={accentColor}>Thông tin nhận dạng:</strong> Tên đầy đủ, địa chỉ email, số điện thoại.
                  </li>
                  <li>
                    <strong className={accentColor}>Thông tin giao dịch:</strong> Địa chỉ giao hàng, lịch sử mua hàng, thông tin thanh toán (không lưu
                    trữ chi tiết thẻ tín dụng).
                  </li>
                  <li>
                    <strong className={accentColor}>Dữ liệu kỹ thuật:</strong> Địa chỉ IP, loại trình duyệt, thời gian truy cập và các dữ liệu liên
                    quan đến thiết bị/phiên truy cập.
                  </li>
                </ul>
              </section>

              {/* --- 2. Mục đích sử dụng --- */}
              <section>
                <h2 className={sectionTitleStyle}>2. Mục Đích Sử Dụng Thông Tin</h2>
                <p className={secondaryTextColor}>Dữ liệu cá nhân của quý khách được sử dụng với các mục đích thiết yếu sau:</p>
                <ul className="list-disc space-y-2 pl-6 pt-2 text-gray-800">
                  <li>
                    <strong className={accentColor}>Xử lý Đơn hàng:</strong> Hoàn thành giao dịch, giao hàng và cung cấp dịch vụ hỗ trợ liên quan.
                  </li>
                  <li>
                    <strong className={accentColor}>Cải thiện Dịch vụ:</strong> Phân tích hành vi người dùng để tối ưu hóa website, cải thiện chất
                    lượng sản phẩm và dịch vụ.
                  </li>
                  <li>
                    <strong className={accentColor}>Hỗ trợ Khách hàng:</strong> Trả lời các yêu cầu, thắc mắc và cung cấp thông tin bảo hành.
                  </li>
                  <li>
                    <strong className={accentColor}>Marketing (tùy chọn):</strong> Gửi thông tin về sản phẩm, chương trình khuyến mãi nếu quý khách
                    đồng ý.
                  </li>
                </ul>
              </section>

              {/* --- 3. Bảo mật thông tin --- */}
              <section>
                <h2 className={sectionTitleStyle}>3. Bảo Mật và Chia Sẻ Dữ Liệu</h2>
                <p className={secondaryTextColor}>
                  **7teck** áp dụng các biện pháp kỹ thuật và tổ chức nghiêm ngặt nhất để bảo vệ thông tin cá nhân của khách hàng:
                </p>
                <ul className="list-disc space-y-2 pl-6 pt-2 text-gray-800">
                  <li>
                    Sử dụng giao thức <strong className={accentColor}>mã hóa SSL/TLS</strong> cho tất cả các giao dịch trực tuyến.
                  </li>
                  <li>Giới hạn quyền truy cập thông tin cá nhân chỉ cho những nhân viên có nhiệm vụ cụ thể và cần thiết.</li>
                  <li>
                    Chúng tôi <strong className="font-bold text-red-600">cam kết không bán</strong>, cho thuê hoặc tiết lộ thông tin cá nhân của quý
                    khách cho bất kỳ bên thứ ba nào, trừ trường hợp bắt buộc theo luật pháp hoặc khi cần thiết để hoàn tất đơn hàng (ví dụ: chia sẻ
                    địa chỉ cho đơn vị vận chuyển).
                  </li>
                </ul>
              </section>

              {/* --- 4. Quyền lợi của Khách hàng --- */}
              <section>
                <h2 className={sectionTitleStyle}>4. Quyền Lợi Của Khách Hàng</h2>
                <p className={secondaryTextColor}>Quý khách có toàn quyền kiểm soát thông tin cá nhân của mình, bao gồm:</p>
                <ul className="list-disc space-y-2 pl-6 pt-2 text-gray-800">
                  <li>
                    <strong className={accentColor}>Truy cập và Chỉnh sửa:</strong> Yêu cầu truy cập, cập nhật hoặc chỉnh sửa thông tin cá nhân của
                    mình.
                  </li>
                  <li>
                    <strong className={accentColor}>Rút lại Sự đồng ý:</strong> Yêu cầu ngừng sử dụng dữ liệu cho mục đích marketing bất cứ lúc nào.
                  </li>
                  <li>
                    <strong className={accentColor}>Yêu cầu Xóa:</strong> Yêu cầu xóa dữ liệu cá nhân (tùy thuộc vào nghĩa vụ pháp lý của chúng tôi).
                  </li>
                </ul>
              </section>
            </article>

            {/* --- Footer - Liên hệ --- */}
            <div className="mt-10 border-t border-gray-100 pt-8 text-center text-base">
              <h2 className={`mb-4 text-2xl font-bold ${accentColor} xl:text-3xl`}>Liên Hệ Hỗ Trợ</h2>
              <p className={`mb-4 ${secondaryTextColor}`}>
                Nếu quý khách có bất kỳ thắc mắc nào về nội dung Chính sách quyền riêng tư, vui lòng liên hệ với bộ phận chăm sóc khách hàng của chúng
                tôi:
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
              <p>Chính sách này có hiệu lực từ ngày: **26/06/2025**.</p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
