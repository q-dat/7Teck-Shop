'use client';
import HeaderResponsive from '@/components/userPage/ui/HeaderResponsive';
import Link from 'next/link';
import Image from 'next/image';
import { images } from '../../../../public/images';
import { hotlineUrl, mailUrl, ggMapShareUrl, address, messengerUrl, zaloUrl, fanpageUrl } from '@/utils/socialLinks';
import { imagePages } from '../../../../public/pages';

export default function WarrantyPage() {
  // Định nghĩa màu sắc trung tính cho style nhất quán
  const primaryTextColor = 'text-gray-900';
  const secondaryTextColor = 'text-gray-600';
  const accentColor = 'text-black'; // Màu nhấn
  const accentBg = 'bg-black'; // Màu nền nhấn
  const accentHover = 'hover:bg-gray-700'; // Hover cho màu nhấn

  // Style cho các thẻ liên hệ
  const contactLinkStyle = 'font-semibold text-black hover:text-gray-700 transition-colors';

  return (
    <div>
      <HeaderResponsive Title_NavbarMobile="7teck.vn" />
      <div className="py-[60px] xl:pt-0">
        {/* Breadcrumbs: Sắc nét hơn */}
        <div className="breadcrumbs border-b border-gray-100 px-[10px] py-2 text-sm text-gray-500 xl:px-desktop-padding">
          <ul className="font-medium">
            <li>
              <Link role="navigation" aria-label="Trang chủ" href="/" className="transition-colors hover:text-black">
                Trang Chủ
              </Link>
            </li>
            <li>
              <span className="font-semibold text-black">Chính Sách Bảo Hành</span>
            </li>
          </ul>
        </div>

        {/* --- Nội dung UI - Kết hợp nội dung chi tiết --- */}
        <div className="px-[10px] py-6 xl:px-desktop-padding">
          {/* Section 1: Giới thiệu bảo hành (Minimalist Title) */}
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm xl:p-8">
            <h1 className={`text-center text-3xl font-bold ${primaryTextColor} sm:text-4xl xl:text-5xl`}>Chính Sách Bảo Hành Sản Phẩm</h1>
            <p className={`w-full text-center leading-relaxed ${secondaryTextColor} mt-2 text-base xl:text-lg`}>
              7teck cam kết mang đến cho khách hàng trải nghiệm mua sắm an tâm cùng chính sách bảo hành rõ ràng, minh bạch đối với các sản phẩm điện
              thoại và laptop.
            </p>

            {/* Hình ảnh minh họa: Tối ưu kích thước */}
            <div className="mt-6 flex w-full justify-center">
              <Image
                src={imagePages.WarrantyPage1}
                alt="Bảo hành chính hãng"
                width={700} // Giảm width
                height={350} // Giảm height
                className="w-full max-w-4xl rounded-lg object-cover shadow-md"
              />
            </div>
          </div>

          <hr className="my-8 border-gray-100" />

          {/* --- Section 2: Grid Layout - Chi tiết Chính Sách (Tối ưu hóa Spacing) --- */}
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm xl:p-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10">
              {' '}
              {/* Giảm gap */}
              {/* Left Column */}
              <section className="space-y-6 xl:space-y-8">
                {' '}
                {/* Giảm space-y */}
                {/* Thời Gian Bảo Hành */}
                <div>
                  <h2 className={`mb-3 text-2xl font-bold ${accentColor} sm:text-2xl`}>Thời Gian Bảo Hành</h2>
                  <ul className="list-disc space-y-2 pl-6 text-base text-gray-700">
                    <li>
                      <strong className={accentColor}>Điện thoại:</strong> Bảo hành 6 tháng cho máy, 1 tháng cho pin và sạc.
                    </li>
                    <li>
                      <strong className={accentColor}>Laptop:</strong> Bảo hành 12 tháng cho phần cứng (không bao gồm pin và sạc).
                    </li>
                    <li>
                      <strong className={accentColor}>Đổi mới:</strong> Sản phẩm được đổi mới trong 7 ngày đầu nếu phát sinh lỗi phần cứng do nhà sản
                      xuất.
                    </li>
                  </ul>
                </div>
                {/* Điều Kiện Bảo Hành */}
                <div>
                  <h2 className={`mb-3 text-2xl font-bold ${accentColor} sm:text-2xl`}>Điều Kiện Bảo Hành</h2>
                  <ul className="list-disc space-y-2 pl-6 text-base text-gray-700">
                    <li>
                      Sản phẩm còn trong thời hạn bảo hành và có <strong className={accentColor}>hóa đơn mua hàng</strong> từ 7teck.
                    </li>
                    <li>
                      <strong className={accentColor}>Tem bảo hành</strong>, số IMEI/SN còn nguyên vẹn, không bị tẩy xóa hay chỉnh sửa.
                    </li>
                    <li>Không bị rơi vỡ, vô nước, cháy nổ hoặc can thiệp phần cứng/phần mềm từ bên thứ ba.</li>
                  </ul>
                </div>
              </section>
              {/* Right Column */}
              <section className="space-y-6 xl:space-y-8">
                {' '}
                {/* Giảm space-y */}
                {/* Quy Trình Bảo Hành */}
                <div>
                  <h2 className={`mb-3 text-2xl font-bold ${accentColor} sm:text-2xl`}>Quy Trình Bảo Hành</h2>
                  <ol className="list-decimal space-y-2 pl-6 text-base text-gray-700">
                    <li>
                      <strong className={accentColor}>Bước 1:</strong> Liên hệ bộ phận CSKH 7teck qua hotline, zalo hoặc email để thông báo lỗi sản
                      phẩm.
                    </li>
                    <li>
                      <strong className={accentColor}>Bước 2:</strong> Nhân viên kỹ thuật xác nhận và hướng dẫn gửi sản phẩm về trung tâm bảo hành.
                    </li>
                    <li>
                      <strong className={accentColor}>Bước 3:</strong> Thời gian xử lý bảo hành:{' '}
                      <strong className={accentColor}>3 - 7 ngày làm việc</strong> (không tính thời gian vận chuyển).
                    </li>
                  </ol>
                </div>
                {/* Trường Hợp Từ Chối Bảo Hành */}
                <div>
                  <h2 className={`mb-3 text-2xl font-bold ${accentColor} sm:text-2xl`}>Trường Hợp Từ Chối Bảo Hành</h2>
                  <ul className="list-disc space-y-2 pl-6 text-base text-gray-700">
                    <li>
                      Sản phẩm bị hư hỏng do <strong className="text-red-600">lỗi người dùng</strong> (rơi vỡ, vào nước, cháy nổ).
                    </li>
                    <li>Sản phẩm hết thời gian bảo hành hoặc không có hóa đơn chứng minh mua hàng tại 7teck.</li>
                    <li>
                      Sản phẩm bị mất tem bảo hành hoặc có dấu hiệu <strong className="text-red-600">sửa chữa trái phép</strong>.
                    </li>
                  </ul>
                </div>
              </section>
            </div>

            {/* Hình ảnh minh họa cho quy trình: Tối ưu kích thước */}
            <div className="mt-8 flex justify-center">
              <Image src={imagePages.WarrantyPage2} alt="Quy trình bảo hành" width={500} height={250} className="rounded-lg object-cover shadow-md" />
            </div>
          </div>

          <hr className="my-8 border-gray-100" />

          {/* --- Section 3: Bảo Hành Theo Sản Phẩm (Đã làm sạch style) --- */}
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm xl:p-8">
            <h2 className={`mb-6 text-2xl font-bold ${accentColor} md:text-3xl`}>Danh Mục Sản Phẩm & Cam Kết Bảo Hành</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Card Laptop */}
              <div className="rounded-lg border border-gray-200 p-4 text-center transition-shadow hover:shadow-lg">
                <Image
                  src="https://source.unsplash.com/random/300x200/?laptop,warranty,technology" // Giữ source random cho ví dụ
                  alt="Laptop"
                  width={300}
                  height={200}
                  className="mb-3 h-[150px] w-full rounded-md object-cover"
                />
                <h3 className={`text-lg font-bold ${accentColor}`}>Laptop</h3>
                <p className={secondaryTextColor}>
                  Bảo hành <strong className={accentColor}>12 tháng</strong>, hỗ trợ phần mềm trọn đời.
                </p>
              </div>

              {/* Card Điện thoại */}
              <div className="rounded-lg border border-gray-200 p-4 text-center transition-shadow hover:shadow-lg">
                <Image
                  src="https://source.unsplash.com/random/300x200/?phone,warranty,screen"
                  alt="Điện thoại"
                  width={300}
                  height={200}
                  className="mb-3 h-[150px] w-full rounded-md object-cover"
                />
                <h3 className={`text-lg font-bold ${accentColor}`}>Điện Thoại</h3>
                <p className={secondaryTextColor}>
                  Bảo hành <strong className={accentColor}>6 tháng</strong>, đổi mới 7 ngày.
                </p>
              </div>

              {/* Card PC */}
              <div className="rounded-lg border border-gray-200 p-4 text-center transition-shadow hover:shadow-lg">
                <Image
                  src="https://source.unsplash.com/random/300x200/?pc,warranty,desktop"
                  alt="PC"
                  width={300}
                  height={200}
                  className="mb-3 h-[150px] w-full rounded-md object-cover"
                />
                <h3 className={`text-lg font-bold ${accentColor}`}>PC/Linh kiện</h3>
                <p className={secondaryTextColor}>
                  Bảo hành linh kiện riêng lẻ lên đến <strong className={accentColor}>36 tháng</strong>.
                </p>
              </div>
            </div>
          </div>

          <hr className="my-8 border-gray-100" />

          {/* --- Section 4: Liên Hệ & Hỗ Trợ (Tối ưu hóa CTA/Links) --- */}
          <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm xl:p-8">
            <div className="flex w-full flex-col items-center justify-center gap-6 rounded-md border border-gray-100 bg-white p-6 text-center xl:flex-row xl:p-8">
              <div className="flex w-full items-center justify-center xl:w-1/3">
                <Image
                  width={140}
                  height={140}
                  src={images.Logo}
                  alt="7teck Logo"
                  className="h-[140px] w-[140px] rounded-full border border-gray-200 object-contain"
                  loading="lazy"
                />
              </div>

              <div className="w-full xl:w-2/3 xl:text-start">
                <h1 className={`mb-3 text-2xl font-bold ${accentColor} md:text-3xl`}>Liên Hệ Hỗ Trợ Bảo Hành</h1>
                <p className={`mb-6 ${secondaryTextColor}`}>
                  Đội ngũ của chúng tôi luôn sẵn sàng hỗ trợ bạn. Hãy chọn kênh liên lạc thuận tiện nhất để được phục vụ nhanh chóng:
                </p>

                <ul className="space-y-3 text-start text-gray-800">
                  <li>
                    📞 Hotline:{' '}
                    <a href={hotlineUrl} aria-label="Gọi hotline 0333 133 050" className={contactLinkStyle}>
                      0333 133 050
                    </a>
                  </li>
                  <li>
                    📧 Email:{' '}
                    <a href={mailUrl} aria-label="Gửi email cskh.7teck@gmail.com" className={contactLinkStyle}>
                      cskh.7teck@gmail.com
                    </a>
                  </li>
                  <li>
                    📍 Địa chỉ Bảo hành:{' '}
                    <a href={ggMapShareUrl} target="_blank" aria-label={`Xem địa chỉ ${address} trên Google Maps`} className={contactLinkStyle}>
                      {address}
                    </a>
                  </li>
                  <li>
                    💬 Messenger:{' '}
                    <a href={messengerUrl} target="_blank" aria-label="Nhắn tin Messenger để bảo hành" className={contactLinkStyle}>
                      Chat ngay
                    </a>
                  </li>
                </ul>

                {/* CTA */}
                <div className="mt-8">
                  <Link
                    href={hotlineUrl}
                    target="_blank"
                    aria-label="Gọi ngay để được hỗ trợ bảo hành"
                    className={`inline-block rounded-lg ${accentBg} px-8 py-3 font-semibold text-white shadow-md transition ${accentHover}`}
                  >
                    Gọi Hotline Hỗ Trợ
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <hr className="my-8 border-gray-100" />

          {/* --- Section 5: Câu hỏi thường gặp (Minimalist Accordion-like) --- */}
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm xl:p-8">
            <h2 className={`mb-6 text-2xl font-bold ${accentColor} md:text-3xl`}>Các Câu Hỏi Thường Gặp (FAQ)</h2>
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <h3 className={`font-bold ${accentColor} text-lg`}>Bảo hành có áp dụng cho sản phẩm đã qua sử dụng (second-hand) không?</h3>
                <p className={`text-base ${secondaryTextColor} mt-1`}>
                  Có, chính sách bảo hành được áp dụng cho mọi sản phẩm bán ra tại 7teck. Thời gian bảo hành cụ thể sẽ được ghi rõ trên hóa đơn và tem
                  bảo hành tùy theo tình trạng sản phẩm.
                </p>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <h3 className={`font-bold ${accentColor} text-lg`}>Thời gian sửa chữa bảo hành trung bình là bao lâu?</h3>
                <p className={`text-base ${secondaryTextColor} mt-1`}>
                  Thời gian xử lý thông thường là từ <strong className={accentColor}>3 đến 7 ngày làm việc</strong>. Trong trường hợp cần thay thế
                  linh kiện hiếm hoặc phức tạp, chúng tôi sẽ thông báo chi tiết đến quý khách.
                </p>
              </div>

              <div className="pb-4">
                <h3 className={`font-bold ${accentColor} text-lg`}>Tôi có thể gửi sản phẩm bảo hành qua đường bưu điện không?</h3>
                <p className={`text-base ${secondaryTextColor} mt-1`}>
                  Hoàn toàn có thể. Vui lòng liên hệ Hotline trước khi gửi để nhân viên hỗ trợ quy trình và đảm bảo sản phẩm được đóng gói an toàn khi
                  vận chuyển.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-8">
              <Link
                href={messengerUrl}
                target="_blank"
                aria-label="Gửi câu hỏi về bảo hành qua Messenger"
                className={`inline-block rounded-lg ${accentBg} px-8 py-3 font-semibold text-white shadow-md transition ${accentHover}`}
              >
                Đặt Câu Hỏi Chi Tiết
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
