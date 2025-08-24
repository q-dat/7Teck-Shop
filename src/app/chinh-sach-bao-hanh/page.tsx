'use client';

import HeaderResponsive from '@/components/userPage/ui/HeaderResponsive';
import Link from 'next/link';
import Image from 'next/image';

export default function WarrantyPage() {
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
              <Link role="navigation" aria-label="Bảo hành" href="/bao-hanh" className="text-black hover:text-primary">
                Bảo Hành
              </Link>
            </li>
          </ul>
        </div>

        {/* Nội dung UI - Kết hợp nội dung chi tiết */}
        <div className="px-[10px] py-6 xl:px-desktop-padding">
          {/* Section 1: Giới thiệu bảo hành */}
          <div className="rounded-xl bg-white p-6 shadow-md md:p-10">
            <h1 className="mb-6 text-center text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">Chính Sách Bảo Hành Sản Phẩm – 7teck</h1>
            <p className="mx-auto mb-10 max-w-2xl text-center leading-relaxed text-gray-600">
              7teck cam kết mang đến cho khách hàng trải nghiệm mua sắm an tâm cùng chính sách bảo hành rõ ràng, minh bạch đối với các sản phẩm điện
              thoại và laptop.
            </p>

            {/* Hình ảnh minh họa */}
            <div className="mb-6 flex justify-center">
              <Image
                src="https://source.unsplash.com/random/800x400/?warranty,badge"
                alt="Bảo hành chính hãng"
                width={800}
                height={400}
                className="rounded-lg shadow-md"
              />
            </div>
          </div>

          {/* Grid Layout - Kết hợp Thời gian, Điều kiện, Quy trình, Từ chối */}
          <div className="mt-10 rounded-xl bg-white p-6 shadow-md md:p-10">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
              {/* Left Column */}
              <section className="space-y-8">
                <div>
                  <h2 className="mb-4 text-xl font-semibold text-gray-900 sm:text-2xl">Thời Gian Bảo Hành</h2>
                  <ul className="list-disc space-y-2 pl-6 text-black">
                    <li>Điện thoại: Bảo hành 6 tháng cho máy, 1 tháng cho pin và sạc.</li>
                    <li>Laptop: Bảo hành 12 tháng cho phần cứng (không bao gồm pin và sạc).</li>
                    <li>Sản phẩm đổi mới trong 7 ngày đầu nếu phát sinh lỗi phần cứng do nhà sản xuất (không áp dụng với lỗi người dùng).</li>
                  </ul>
                </div>

                <div>
                  <h2 className="mb-4 text-xl font-semibold text-gray-900 sm:text-2xl">Điều Kiện Bảo Hành</h2>
                  <ul className="list-disc space-y-2 pl-6 text-black">
                    <li>Sản phẩm còn trong thời hạn bảo hành và có hóa đơn mua hàng từ 7teck.</li>
                    <li>Tem bảo hành, số IMEI/SN còn nguyên vẹn, không bị tẩy xóa hay chỉnh sửa.</li>
                    <li>Sản phẩm không bị rơi vỡ, vô nước, cháy nổ hoặc can thiệp phần cứng/phần mềm từ bên thứ ba.</li>
                  </ul>
                </div>
              </section>

              {/* Right Column */}
              <section className="space-y-8">
                <div>
                  <h2 className="mb-4 text-xl font-semibold text-gray-900 sm:text-2xl">Quy Trình Bảo Hành</h2>
                  <ol className="list-decimal space-y-2 pl-6 text-black">
                    <li>Liên hệ bộ phận CSKH 7teck qua hotline, zalo hoặc email để thông báo lỗi sản phẩm.</li>
                    <li>Nhân viên kỹ thuật xác nhận và hướng dẫn gửi sản phẩm về trung tâm bảo hành.</li>
                    <li>Thời gian xử lý bảo hành: 3 - 7 ngày làm việc (không tính thời gian vận chuyển).</li>
                  </ol>
                </div>

                <div>
                  <h2 className="mb-4 text-xl font-semibold text-gray-900 sm:text-2xl">Trường Hợp Từ Chối Bảo Hành</h2>
                  <ul className="list-disc space-y-2 pl-6 text-black">
                    <li>Sản phẩm bị hư hỏng do lỗi người dùng như rơi vỡ, vào nước, cháy nổ, hoặc can thiệp từ bên ngoài.</li>
                    <li>Sản phẩm hết thời gian bảo hành hoặc không có hóa đơn chứng minh mua hàng tại 7teck.</li>
                    <li>Sản phẩm bị mất tem bảo hành hoặc có dấu hiệu sửa chữa trái phép.</li>
                  </ul>
                </div>
              </section>
            </div>

            {/* Hình ảnh minh họa cho quy trình */}
            <div className="mt-6 flex justify-center">
              <Image
                src="https://source.unsplash.com/random/600x300/?warranty,process"
                alt="Quy trình bảo hành"
                width={600}
                height={300}
                className="rounded-lg shadow-md"
              />
            </div>
          </div>

          {/* Section: Bảo Hành Theo Sản Phẩm (từ nội dung cũ) */}
          <div className="mt-10 rounded-xl bg-white p-6 shadow-md md:p-10">
            <h2 className="mb-4 text-xl font-bold text-primary md:text-2xl">Bảo Hành Theo Sản Phẩm</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-lg bg-gray-100 p-4 text-center">
                <Image
                  src="https://source.unsplash.com/random/300x200/?laptop,warranty"
                  alt="Laptop"
                  width={300}
                  height={200}
                  className="mx-auto mb-2 rounded-md"
                />
                <h3 className="text-lg font-semibold">Laptop</h3>
                <p className="text-gray-600">Bảo hành 12-24 tháng, hỗ trợ sửa chữa nhanh chóng.</p>
              </div>
              <div className="rounded-lg bg-gray-100 p-4 text-center">
                <Image
                  src="https://source.unsplash.com/random/300x200/?phone,warranty"
                  alt="Điện thoại"
                  width={300}
                  height={200}
                  className="mx-auto mb-2 rounded-md"
                />
                <h3 className="text-lg font-semibold">Điện Thoại</h3>
                <p className="text-gray-600">Bảo hành 12 tháng, đổi mới nếu lỗi phần cứng.</p>
              </div>
              <div className="rounded-lg bg-gray-100 p-4 text-center">
                <Image
                  src="https://source.unsplash.com/random/300x200/?pc,warranty"
                  alt="PC"
                  width={300}
                  height={200}
                  className="mx-auto mb-2 rounded-md"
                />
                <h3 className="text-lg font-semibold">PC</h3>
                <p className="text-gray-600">Bảo hành linh kiện riêng lẻ lên đến 36 tháng.</p>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <section className="mt-10 rounded-xl bg-white p-6 shadow-md md:p-10">
            <div className="flex flex-col items-center justify-center gap-4 bg-primary p-4 text-center md:flex-row xl:gap-10">
              <div>
                <Image
                  width={160}
                  height={160}
                  src="https://source.unsplash.com/random/160x160/?logo,tech"
                  alt="7teck Logo"
                  className="h-[160px] w-[160px] rounded-full object-contain"
                  loading="lazy"
                />
              </div>

              <div>
                <p className="mx-auto mb-4 max-w-xl text-white">Nếu quý khách có thắc mắc về chính sách bảo hành, vui lòng liên hệ:</p>
                <ul className="inline-block space-y-2 text-left text-white">
                  <li>
                    <a href="tel:0333133050" className="transition-colors duration-200 hover:text-blue-600" aria-label="Gọi hotline 0333133050">
                      📞 Hotline: 0333133050
                    </a>
                  </li>
                  <li>
                    <a
                      href="mailto:baohanh@7teck.vn"
                      className="transition-colors duration-200 hover:text-blue-600"
                      aria-label="Gửi email đến baohanh@7teck.vn"
                    >
                      📧 Email: cskh.7teck@gmail.com
                    </a>
                  </li>
                  <li>🏢 Địa chỉ: 136/136 Trần Quang Diệu, Phường 12, Quận 3, HCM</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4: Câu hỏi thường gặp (từ nội dung cũ) */}
          <div className="mt-10 rounded-xl bg-white p-6 shadow-md md:p-10">
            <h2 className="mb-4 text-xl font-bold text-primary md:text-2xl">Câu Hỏi Thường Gặp</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Bảo hành có áp dụng cho sản phẩm cũ không?</h3>
                <p className="text-gray-600">Có, tùy theo tình trạng sản phẩm.</p>
              </div>
              <div>
                <h3 className="font-semibold">Thời gian sửa chữa bao lâu?</h3>
                <p className="text-gray-600">Thường từ 3-7 ngày tùy lỗi.</p>
              </div>
            </div>
            {/* CTA */}
            <div className="mt-6">
              <button className="rounded-lg bg-primary px-6 py-3 font-semibold text-white shadow-md transition hover:bg-secondary">
                Liên Hệ Bảo Hành
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
