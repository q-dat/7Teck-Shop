'use client';
import ErrorLoading from '@/components/orther/error/ErrorLoading';
import HeaderResponsive from '@/components/userPage/ui/HeaderResponsive';
import Zoom from '@/lib/Zoom';
import { IGallery } from '@/types/type/gallery/gallery';
import Image from 'next/image';
import Link from 'next/link';
import Masonry from 'react-masonry-css';

export default function ClientGalleryPage({ galleries }: { galleries: IGallery[] }) {
  if (galleries.length === 0) return <ErrorLoading />;

  return (
    <div className="bg-white">
      <HeaderResponsive Title_NavbarMobile="7teck.vn" />
      <div className="py-[60px] xl:pt-0">
        {/* --- Breadcrumbs: Minimalist Style --- */}
        <div className="breadcrumbs border-b border-gray-100 px-[10px] py-3 text-sm text-gray-500 xl:px-desktop-padding">
          <ul className="font-medium">
            <li>
              <Link aria-label="Trang chủ" href="/" className="transition-colors xl:hover:text-black">
                Trang Chủ
              </Link>
            </li>
            <li>
              <span className="font-semibold text-black">Hành Trình Cùng Khách Hàng</span>
            </li>
          </ul>
        </div>

        {/* --- Hero Section: Bold Typography --- */}
        <section className="overflow-hidden px-2 py-16 text-center xl:px-desktop-padding xl:py-24">
          <div className="w-full">
            <h1 className="mb-4 text-4xl font-black uppercase tracking-tighter text-black xl:text-7xl">Hành Trình Cùng Khách Hàng</h1>
            <p className="mx-auto mb-8 w-full max-w-4xl text-base font-medium text-gray-700 xl:text-xl">
              Khám phá những khoảnh khắc đáng nhớ và câu chuyện thành công. Chúng tôi tự hào đồng hành với hàng ngàn khách hàng, mang đến giải pháp
              công nghệ hiện đại và dịch vụ xuất sắc.
            </p>
            <Link
              href="/lien-he"
              className="inline-block rounded-md border border-black bg-black px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition-all duration-300 xl:hover:bg-white xl:hover:text-black"
            >
              Tham Gia Ngay
            </Link>
          </div>
        </section>

        {/* --- Gallery Masonry Layout --- */}
        <div className="px-2 xl:px-desktop-padding">
          <Masonry
            breakpointCols={{
              default: 6,
              1280: 6,
              1024: 4,
              768: 3,
              640: 2,
            }}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
          >
            {galleries.map((gallery, index) => (
              <div key={index} className="pb-4">
                <Zoom>
                  <div
                    // Style ảnh: Sắc cạnh, border xám, hover chuyển sang border đen và shadow cứng
                    className="group overflow-hidden rounded-lg border border-gray-200 transition-all duration-500 xl:hover:border-black xl:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <Image
                      height={300}
                      width={300}
                      src={`${gallery.gallery}`}
                      alt="Hình ảnh khách hàng"
                      // Hiệu ứng zoom mượt, không quay (rotate) để giữ tính chuyên nghiệp
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                      quality={90}
                    />
                  </div>
                </Zoom>
              </div>
            ))}
          </Masonry>
        </div>
      </div>

      {/* --- Call to Action Section: Clean & Structured --- */}
      <section className="border-t border-gray-100 bg-gray-50 py-16 text-center xl:py-20">
        <div className="w-full px-2 xl:px-desktop-padding">
          <h2 className="mb-3 text-3xl font-black uppercase tracking-tighter text-gray-900 xl:text-4xl">Sẵn Sàng Cho Hành Trình Của Bạn?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-sm font-medium text-gray-600 xl:text-base">
            Hãy liên hệ với chúng tôi để trải nghiệm dịch vụ hàng đầu và trở thành phần của cộng đồng khách hàng hài lòng.
          </p>
          <Link
            href="/dien-thoai"
            className="inline-block rounded-md border border-black bg-white px-6 py-3 text-sm font-bold uppercase tracking-wider text-black transition-all duration-300 xl:hover:bg-black xl:hover:text-white"
          >
            Khám Phá Sản Phẩm
          </Link>
        </div>
      </section>
    </div>
  );
}
