'use client';
import HeaderResponsive from '@/components/userPage/HeaderResponsive';
import { memo, useEffect, useState } from 'react';
import { images } from '../../public/images';
import ClientPhoneFC from './ClientPhoneFC';
import ClientTabletFC from './ClientTabletFC';
import ClientMacbookFC from './ClientMacbookFC';
import ClientWindowsFC from './ClientWindowsFC';
import ClientPostSection from './ClientPostSection';
import { IPhone } from '@/types/type/phone/phone';
import { IMacbook } from '@/types/type/macbook/macbook';
import { ITablet } from '@/types/type/tablet/tablet';
import { IWindows } from '@/types/type/windows/windows';
import { IPost } from '@/types/type/post/post';
import Image from 'next/image';

// Component Banner
const BannerComponent = memo(() => (
  <div className="relative">
    <div className="absolute bottom-0 left-0 top-0 h-full w-full bg-black bg-opacity-10 pl-2 pt-[20%] md:pl-20 md:pt-5 xl:pl-[100px] xl:pt-[4%]">
      <h1 className="text-[25px] font-extrabold text-white xl:text-[40px]">
        Đổi Điện Thoại Cũ , <br />
        Nhận Ngay Giá Tốt Nhất!
      </h1>
      <h2 className="w-[120px] bg-gradient-to-r from-primary via-primary to-transparent text-start text-[20px] font-thin italic text-white">
        up to 90%
      </h2>
    </div>
    <picture className="h-full w-full">
      <source srcSet={images.BannerDesktop} media="(min-width: 1024px)" />
      <source srcSet={images.BannerTablet} media="(min-width: 601px)" />
      <Image height={100} width={100} src={images.BannerMobile} alt="Banner" className="h-full w-full object-cover" loading="eager" />
    </picture>
  </div>
));
BannerComponent.displayName = 'BannerComponent';
const Banner = memo(BannerComponent);

// Component Background Fixed
const BgFixedSectionComponent = memo(() => (
  <div
    className="relative my-10 h-[200px] w-full bg-cover bg-fixed bg-center bg-no-repeat xl:h-[300px]"
    style={{
      backgroundImage: `url(${images.bgFixed})`,
    }}
  >
    <div className="absolute left-1/2 top-1/2 flex h-full w-full -translate-x-1/2 -translate-y-1/2 transform flex-col items-center justify-center bg-black bg-opacity-30 px-2 text-lg font-light text-white xl:px-desktop-padding xl:text-3xl">
      <h2 className="font-semibold" uk-parallax="opacity: 0,9; y: -50,0; scale: 2,1; end: 50vh + 50%;">
        iPhone 16 Pro Max
      </h2>
      <i className="text-center" uk-parallax="opacity: 0,9; y: 50,0; scale: 0.5,1; end: 50vh + 50%;">
        Trải nghiệm công nghệ đỉnh cao với thiết kế mới mẻ, hiệu suất vượt trội và camera siêu nét.
      </i>
    </div>
  </div>
));
BgFixedSectionComponent.displayName = 'BgFixedSectionComponent';
const BgFixedSection = memo(BgFixedSectionComponent);

interface ClientHomePageProps {
  mostViewedPhones: IPhone[];
  macbook: IMacbook[];
  tablets: ITablet[];
  windows: IWindows[];
  posts: IPost[];
}

export default function ClientHomePage({ mostViewedPhones, tablets, macbook, windows, posts }: ClientHomePageProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (mostViewedPhones.length === 0) {
      const fetchData = async () => {
        setLoading(true);
      };

      fetchData();
    } else {
      setLoading(false);
    }
  }, [mostViewedPhones]);

  return (
    <div>
      <HeaderResponsive Title_NavbarMobile="Trang Chủ" />
      <div className="pt-[60px] xl:pt-0">
        <Banner />
        {/* <BenefitsSection /> */}
        {/* Product Section */}
        {/* <div data-aos="fade-down"> */}
        <ClientPhoneFC mostViewedPhones={mostViewedPhones} loading={loading} />
        {/* </div> */}
        {/* Bg Fixed */}
        {mostViewedPhones.length !== 0 && <BgFixedSection />}
        {/* Discounted Products Section */}
        <div className="flex w-full flex-col items-center justify-center gap-5">
          {[ClientTabletFC, ClientMacbookFC, ClientWindowsFC].map((Component, index) => (
            <div
              key={index}
              //  data-aos="fade-up"
              className="w-full"
            >
              <Component macbook={macbook} tablets={tablets} windows={windows} />
            </div>
          ))}
        </div>

        <ClientPostSection posts={posts} />
      </div>
    </div>
  );
}
