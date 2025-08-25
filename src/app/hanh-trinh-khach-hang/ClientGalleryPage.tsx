'use client';
import ErrorLoading from '@/components/orther/error/ErrorLoading';
import HeaderResponsive from '@/components/userPage/ui/HeaderResponsive';
import Zoom from '@/lib/Zoom';
import { IGallery } from '@/types/type/gallery/gallery';
import Image from 'next/image';
import Link from 'next/link';
import Masonry from 'react-masonry-css';

export default function ClientGalleryPage({ galleries }: { galleries: IGallery[] }) {
  // const [currentPage, setCurrentPage] = useState(1);

  // useEffect(() => {
  //   scrollToTopInstantly();
  // }, []);

  // // Panigation
  // const itemsPerPage = 24;

  // const totalPages = Math.ceil(galleries.length / itemsPerPage);
  // const indexOfLastItem = currentPage * itemsPerPage;
  // const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // const currentGallerys = galleries.slice(indexOfFirstItem, indexOfLastItem);

  // const handleNextPage = () => {
  //   if (currentPage < totalPages) {
  //     setCurrentPage(currentPage + 1);
  //   }
  // };

  // const handlePrevPage = () => {
  //   if (currentPage > 1) {
  //     setCurrentPage(currentPage - 1);
  //   }
  // };
  if (galleries.length === 0) return <ErrorLoading />;
  return (
    <div>
      <HeaderResponsive Title_NavbarMobile="7teck.vn" />
      <div className="py-[60px] xl:pt-0">
        <div className="breadcrumbs px-[10px] py-2 text-sm text-black shadow dark:text-white xl:px-desktop-padding">
          <ul className="font-light">
            <li>
              <Link aria-label="Trang chủ" href="/">
                Trang Chủ
              </Link>
            </li>
            <li>
              <Link aria-label="Hành trình cùng khách hàng" href="">
                Hành Trình Cùng Khách Hàng
              </Link>
            </li>
          </ul>
        </div>
        {/*  */}
        <section className="overflow-hidden px-2 py-10 xl:px-desktop-padding">
          <div className="w-full text-center">
            <h1 className="mb-2 font-serif text-2xl font-bold xl:text-7xl">Hành Trình Cùng Khách Hàng</h1>
            <p className="mb-5 w-full text-sm font-light text-gray-700 xl:text-xl">
              Khám phá những câu chuyện thành công và khoảnh khắc đáng nhớ cùng <span className="font-medium text-primary">7teck.vn</span>. Chúng tôi
              tự hào đồng hành với hàng ngàn khách hàng, mang đến giải pháp công nghệ hiện đại và dịch vụ xuất sắc.
            </p>
            <Link href="/lien-he" className="inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary">
              Tham Gia Ngay
            </Link>
          </div>
        </section>
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
              <div key={index}>
                <Zoom>
                  <div className="group overflow-hidden rounded-xl border border-gray-200/50 transition-all duration-500 hover:border-primary-lighter/50">
                    <Image
                      height={300}
                      width={300}
                      src={`${gallery.gallery}`}
                      alt="Hình ảnh khách hàng"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:rotate-2 group-hover:scale-110"
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

      {/* Call to Action Section */}
      <section className="to-primary-lifrom-primary-lighter/40 bg-gradient-to-r from-primary-lighter/20 py-20 text-center">
        <div className="w-full px-2 xl:px-desktop-padding">
          <h2 className="mb-2 text-4xl font-bold text-gray-800">Sẵn Sàng Cho Hành Trình Của Bạn?</h2>
          <p className="mb-5 text-xs text-gray-600">
            Hãy liên hệ với chúng tôi để trải nghiệm dịch vụ hàng đầu và trở thành phần của cộng đồng khách hàng hài lòng.
          </p>
          <Link href="/dien-thoai" className="inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary">
            Khám Phá Sản Phẩm
          </Link>
        </div>
      </section>
    </div>
  );
}
