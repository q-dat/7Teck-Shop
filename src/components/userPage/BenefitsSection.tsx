'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FaShippingFast, FaShieldAlt, FaTags } from 'react-icons/fa';
import { images } from '../../../public/images';

gsap.registerPlugin(ScrollTrigger);

const programs = [
  {
    icon: <FaShippingFast className="text-4xl text-primary" />,
    title: 'Tư Vấn Chọn Máy Theo Nhu Cầu',
    subtitle: 'Hỗ trợ tìm sản phẩm phù hợp',
    desc: 'Đội ngũ kỹ thuật giúp bạn chọn điện thoại, laptop, PC phù hợp từng nhu cầu: học tập, văn phòng, đồ họa, gaming.',
    badge: 'Expert',
    cta: 'Nhận Tư Vấn',
    link: '/tu-van',
    bg: `${images.Ip16PM}`,
  },
  {
    icon: <FaShieldAlt className="text-4xl text-primary" />,
    title: 'Cam Kết Hàng Chính Hãng',
    subtitle: 'Bảo hành minh bạch',
    desc: 'Sản phẩm nhập chính ngạch, kèm hóa đơn VAT, bảo hành rõ ràng, 1 đổi 1 nếu lỗi NSX.',
    badge: 'Trust',
    cta: 'Xem Chi Tiết',
    link: '/chinh-sach-bao-hanh',
    bg: `${images.MacProM4}`,
  },
  {
    icon: <FaTags className="text-4xl text-primary" />,
    title: 'Thu Cũ Đổi Mới & Trả Góp Linh Hoạt',
    subtitle: 'Giải pháp mua sắm dễ dàng',
    desc: 'Đổi thiết bị cũ lấy máy mới, trả góp linh hoạt 0%, sở hữu thiết bị dễ dàng hơn.',
    badge: 'Value',
    cta: 'Tìm Hiểu Thêm',
    link: '/bang-gia-thu-mua',
    bg: `${images.OppoReno14}`,
  },
  {
    icon: <FaShippingFast className="text-4xl text-primary" />,
    title: 'Dịch Vụ Cài Đặt & Hỗ Trợ 24/7',
    subtitle: 'Đồng hành cùng khách hàng',
    desc: 'Miễn phí cài đặt phần mềm cơ bản, tối ưu hiệu suất và hỗ trợ online 24/7.',
    badge: 'Support',
    cta: 'Liên Hệ',
    link: '/lien-he',
    bg: `${images.LaptopDell}`,
  },
];

const BenefitsSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const sections = gsap.utils.toArray<HTMLElement>('.benefit-card');
    const mm = gsap.matchMedia();

    mm.add(
      {
        isMobile: '(max-width: 1279px)',
        isDesktop: '(min-width: 1280px)',
      },
      (context) => {
        const { isMobile } = context.conditions!;

        gsap.to(sections, {
          xPercent: -100 * (sections.length - 1),
          ease: 'none',
          scrollTrigger: {
            trigger: container,
            pin: true,
            scrub: 0,
            start: isMobile ? 'top 60px' : 'top 130px',
            end: () => `+=${(container.scrollWidth - window.innerWidth) / 2}`,
          },
        });
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <section ref={containerRef} className="relative w-full overflow-hidden bg-gray-50">
      <div className="flex h-[80vh] w-max flex-row xl:h-[calc(100vh-150px)]">
        {programs.map((p, i) => (
          <div
            key={i}
            className="benefit-card relative flex h-full w-screen items-center justify-center bg-cover bg-center bg-no-repeat xl:w-[80vw]"
            style={{ backgroundImage: `url(${p.bg})` }}
          >
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-black/10" />

            {/* Nội dung chính */}
            <div className="relative z-10 flex w-full max-w-6xl flex-col items-center gap-8 px-6 md:flex-row md:items-center md:justify-between xl:gap-16">
              {/* LEFT CONTENT */}
              <div className="max-w-md text-center md:text-left">
                <span className="inline-block rounded-full bg-primary px-3 py-1 text-sm font-semibold text-white shadow-md mb-4">
                  {p.badge}
                </span>
                <h1 className="mb-2 text-2xl font-bold text-white drop-shadow-md md:text-3xl">
                  {p.title}
                </h1>
                <p className="mb-2 text-sm italic text-gray-100">{p.subtitle}</p>
                <p className="mb-4 text-sm text-gray-200 md:text-base">{p.desc}</p>
                <Link
                  href={p.link}
                  className="inline-block rounded-xl bg-primary px-5 py-2 text-sm font-medium text-white shadow-lg transition hover:bg-primary/90"
                >
                  {p.cta}
                </Link>
              </div>

              {/* RIGHT CARD MINI (banner hoặc sản phẩm) */}
              <div className="hidden md:flex flex-col items-center justify-center rounded-2xl bg-white/70 p-6 text-gray-900 shadow-lg backdrop-blur-md">
                <div className="mb-4 flex justify-center">{p.icon}</div>
                <p className="text-center text-sm font-medium">
                  Ưu đãi dành riêng cho <span className="text-primary font-semibold">{p.badge}</span>
                </p>
                <Link
                  href={p.link}
                  className="mt-3 text-sm font-medium text-primary underline-offset-2 hover:underline"
                >
                  Tìm hiểu thêm
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BenefitsSection;
