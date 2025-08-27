'use client';
import HeaderResponsive from '@/components/userPage/ui/HeaderResponsive';
import Link from 'next/link';
import Image from 'next/image';
import { images } from '../../../public/images';
import { hotlineUrl, mailUrl, ggMapShareUrl, address, messengerUrl, zaloUrl, fanpageUrl } from '@/utils/socialLinks';

export default function WarrantyPage() {
  return (
    <div>
      <HeaderResponsive Title_NavbarMobile="7teck.vn" />
      <div className="py-[60px] xl:pt-0">
        <div className="breadcrumbs px-[10px] py-2 text-sm text-black shadow xl:px-desktop-padding">
          <ul className="font-light">
            <li>
              <Link role="navigation" aria-label="Trang chủ" href="/">
                Trang Chủ
              </Link>
            </li>
            <li>
              <Link role="navigation" aria-label="Chính sách bảo hành" href="">
                Chính Sách Bảo Hành
              </Link>
            </li>
          </ul>
        </div>

        {/* Nội dung UI - Kết hợp nội dung chi tiết */}
        <div className="px-[10px] py-6 xl:px-desktop-padding">
          {/* Section 1: Giới thiệu bảo hành */}
          <div className="rounded-xl bg-white p-2 shadow-lg xl:p-6">
            <h1 className="mb-6 text-center text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">Chính Sách Bảo Hành Sản Phẩm – 7teck</h1>
            <p className="mb-10 max-w-2xl text-center leading-relaxed text-gray-600">
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
          <div className="mt-10 rounded-xl bg-white p-2 shadow-lg xl:p-6">
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
          <div className="mt-10 rounded-xl bg-white p-2 shadow-lg xl:p-6">
            <h2 className="mb-4 text-xl font-bold text-primary md:text-2xl">Bảo Hành Theo Sản Phẩm</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-lg bg-primary-lighter p-4 text-center">
                <Image
                  src="https://source.unsplash.com/random/300x200/?laptop,warranty"
                  alt="Laptop"
                  width={300}
                  height={200}
                  className="mb-2 rounded-md"
                />
                <h3 className="text-lg font-semibold">Laptop</h3>
                <p className="text-gray-600">Bảo hành 12-24 tháng, hỗ trợ sửa chữa nhanh chóng.</p>
              </div>
              <div className="rounded-lg bg-primary-lighter p-4 text-center">
                <Image
                  src="https://source.unsplash.com/random/300x200/?phone,warranty"
                  alt="Điện thoại"
                  width={300}
                  height={200}
                  className="mb-2 rounded-md"
                />
                <h3 className="text-lg font-semibold">Điện Thoại</h3>
                <p className="text-gray-600">Bảo hành 12 tháng, đổi mới nếu lỗi phần cứng.</p>
              </div>
              <div className="rounded-lg bg-primary-lighter p-4 text-center">
                <Image src="https://source.unsplash.com/random/300x200/?pc,warranty" alt="PC" width={300} height={200} className="mb-2 rounded-md" />
                <h3 className="text-lg font-semibold">PC</h3>
                <p className="text-gray-600">Bảo hành linh kiện riêng lẻ lên đến 36 tháng.</p>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <section className="mt-10 rounded-xl bg-white p-2 shadow-lg xl:p-6">
            <div className="flex w-full flex-col items-center justify-center gap-2 rounded-md bg-primary-lighter p-4 text-center xl:flex-row">
              <div className="flex w-full items-center justify-center xl:w-1/2">
                <Image
                  width={160}
                  height={160}
                  src={images.Logo}
                  alt="7teck Logo"
                  className="h-[160px] w-[160px] rounded-full object-contain xl:h-1/2 xl:w-1/2"
                  loading="lazy"
                />
              </div>

              <div className="w-full xl:w-1/2">
                <h1 className="mb-4 text-2xl font-bold text-primary md:text-3xl">Liên Hệ Với 7Teck</h1>
                <p className="mb-6 text-gray-700">Đội ngũ của chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7. Hãy chọn kênh liên lạc thuận tiện nhất:</p>

                <ul className="space-y-3 text-start text-gray-800">
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
                    <a href={ggMapShareUrl} target="_blank" className="font-semibold text-primary hover:underline">
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

                {/* CTA */}
                <div className="mt-8">
                  <Link
                    href={messengerUrl}
                    target="_blank"
                    className="inline-block rounded-xl bg-primary px-8 py-3 font-semibold text-white shadow-md transition hover:bg-secondary"
                  >
                    Liên Hệ Ngay
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Câu hỏi thường gặp (từ nội dung cũ) */}
          <div className="mt-10 rounded-xl bg-white p-2 shadow-lg xl:p-6">
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
              <Link
                href="/lien-he"
                target="_blank"
                className="inline-block rounded-xl bg-primary px-8 py-3 font-semibold text-white shadow-md transition hover:bg-secondary"
              >
                Liên Hệ Bảo Hành
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
