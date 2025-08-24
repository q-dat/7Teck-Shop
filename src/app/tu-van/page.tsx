'use client';
import HeaderResponsive from '@/components/userPage/ui/HeaderResponsive';
import Link from 'next/link';
import Image from 'next/image';

export default function ConsultationPage() {
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
              <Link role="navigation" aria-label="Tư vấn chọn máy" href="">
                Tư Vấn Chọn Máy
              </Link>
            </li>
          </ul>
        </div>

        {/* Nội dung UI - Thêm nhiều sections và hình ảnh */}
        <div className="px-[10px] py-6 xl:px-desktop-padding">
          {/* Section 1: Giới thiệu */}
          <div className="rounded-xl bg-white p-6 shadow-md md:p-10">
            <h1 className="mb-4 text-2xl font-bold text-primary md:text-3xl">Tư Vấn Chọn Máy Theo Nhu Cầu</h1>
            <p className="mb-4 text-gray-700">
              Chúng tôi cung cấp dịch vụ tư vấn miễn phí giúp khách hàng chọn lựa điện thoại, laptop, PC theo từng nhu cầu: học tập, văn phòng, đồ
              họa, gaming...
            </p>
            <p className="mb-6 text-gray-700">
              Đội ngũ kỹ thuật viên nhiều kinh nghiệm sẽ giải thích chi tiết về cấu hình, hiệu năng và giá cả để bạn đưa ra quyết định mua hàng phù
              hợp nhất.
            </p>

            {/* Hình ảnh minh họa */}
            <div className="mb-6 flex justify-center">
              <Image
                src="https://source.unsplash.com/random/800x400/?consultation,tech"
                alt="Tư vấn chọn máy"
                width={800}
                height={400}
                className="rounded-lg shadow-md"
              />
            </div>

            {/* CTA */}
            <button className="rounded-lg bg-primary px-6 py-3 font-semibold text-white shadow-md transition hover:bg-secondary">
              Liên Hệ Tư Vấn
            </button>
          </div>

          {/* Section 2: Các loại nhu cầu phổ biến */}
          <div className="mt-10 rounded-xl bg-white p-6 shadow-md md:p-10">
            <h2 className="mb-4 text-xl font-bold text-primary md:text-2xl">Các Nhu Cầu Phổ Biến</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-gray-100 p-4 text-center">
                <Image
                  src="https://source.unsplash.com/random/300x200/?student,laptop"
                  alt="Học tập"
                  width={300}
                  height={200}
                  className="mx-auto mb-2 rounded-md"
                />
                <h3 className="text-lg font-semibold">Học Tập</h3>
                <p className="text-gray-600">Laptop nhẹ, pin lâu, giá phải chăng cho sinh viên.</p>
              </div>
              <div className="rounded-lg bg-gray-100 p-4 text-center">
                <Image
                  src="https://source.unsplash.com/random/300x200/?office,pc"
                  alt="Văn phòng"
                  width={300}
                  height={200}
                  className="mx-auto mb-2 rounded-md"
                />
                <h3 className="text-lg font-semibold">Văn Phòng</h3>
                <p className="text-gray-600">Máy tính ổn định, hỗ trợ làm việc đa nhiệm.</p>
              </div>
              <div className="rounded-lg bg-gray-100 p-4 text-center">
                <Image
                  src="https://source.unsplash.com/random/300x200/?graphic,design"
                  alt="Đồ họa"
                  width={300}
                  height={200}
                  className="mx-auto mb-2 rounded-md"
                />
                <h3 className="text-lg font-semibold">Đồ Họa</h3>
                <p className="text-gray-600">Card đồ họa mạnh, màn hình chất lượng cao.</p>
              </div>
              <div className="rounded-lg bg-gray-100 p-4 text-center">
                <Image
                  src="https://source.unsplash.com/random/300x200/?gaming,pc"
                  alt="Gaming"
                  width={300}
                  height={200}
                  className="mx-auto mb-2 rounded-md"
                />
                <h3 className="text-lg font-semibold">Gaming</h3>
                <p className="text-gray-600">Cấu hình cao, tản nhiệt tốt cho game thủ.</p>
              </div>
            </div>
          </div>

          {/* Section 3: Lợi ích tư vấn */}
          <div className="mt-10 rounded-xl bg-white p-6 shadow-md md:p-10">
            <h2 className="mb-4 text-xl font-bold text-primary md:text-2xl">Lợi Ích Khi Tư Vấn Tại 7Teck</h2>
            <ul className="list-disc space-y-2 pl-6 text-gray-700">
              <li>Tư vấn miễn phí 24/7 qua hotline hoặc chat online.</li>
              <li>So sánh sản phẩm từ nhiều thương hiệu: Apple, Dell, Asus, HP.</li>
              <li>Hỗ trợ kiểm tra máy trực tiếp tại cửa hàng.</li>
              <li>Khuyến mãi đặc biệt cho khách hàng tư vấn trước khi mua.</li>
            </ul>
            <div className="mt-6 flex justify-center">
              <Image
                src="https://source.unsplash.com/random/600x300/?team,consultation"
                alt="Đội ngũ tư vấn"
                width={600}
                height={300}
                className="rounded-lg shadow-md"
              />
            </div>
          </div>

          {/* Section 4: Câu hỏi thường gặp */}
          <div className="mt-10 rounded-xl bg-white p-6 shadow-md md:p-10">
            <h2 className="mb-4 text-xl font-bold text-primary md:text-2xl">Câu Hỏi Thường Gặp</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Tư vấn có mất phí không?</h3>
                <p className="text-gray-600">Hoàn toàn miễn phí!</p>
              </div>
              <div>
                <h3 className="font-semibold">Làm thế nào để liên hệ tư vấn?</h3>
                <p className="text-gray-600">Gọi hotline hoặc chat qua Messenger/Zalo.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
