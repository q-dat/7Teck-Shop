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
    desc: 'Đội ngũ kỹ thuật giúp bạn chọn điện thoại, laptop, PC phù hợp từng mục đích sử dụng.',
    badge: 'Expert',
    cta: 'Nhận Tư Vấn',
    link: '/tu-van',
    bg: images.Ip16PM,
  },
  {
    icon: <FaShieldAlt className="text-4xl text-primary" />,
    title: 'Cam Kết Hàng Chính Hãng',
    subtitle: 'Bảo hành minh bạch',
    desc: 'Sản phẩm chính hãng, có hóa đơn VAT và bảo hành rõ ràng, minh bạch.',
    badge: 'Trust',
    cta: 'Xem Chi Tiết',
    link: '/chinh-sach-bao-hanh',
    bg: images.MacProM4,
  },
  {
    icon: <FaTags className="text-4xl text-primary" />,
    title: 'Thu Cũ Đổi Mới & Trả Góp',
    subtitle: 'Mua sắm dễ dàng',
    desc: 'Thu cũ đổi mới, hỗ trợ trả góp linh hoạt qua thẻ tín dụng 0%.',
    badge: 'Value',
    cta: 'Tìm Hiểu Thêm',
    link: '/bang-gia-thu-mua',
    bg: images.OppoReno14,
  },
  {
    icon: <FaShippingFast className="text-4xl text-primary" />,
    title: 'Hỗ Trợ 24/7',
    subtitle: 'Đồng hành cùng khách hàng',
    desc: 'Cài đặt miễn phí, tối ưu hiệu suất và hỗ trợ kỹ thuật online 24/7.',
    badge: 'Support',
    cta: 'Liên Hệ',
    link: '/lien-he',
    bg: images.LaptopDell,
  },
];

const BenefitsSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const sections = gsap.utils.toArray<HTMLElement>('.benefit-card');

    gsap.to(sections, {
      xPercent: -100 * (sections.length - 1),
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        pin: true,
        scrub: 0.5,
        start: 'top 100px',
        end: () => `+=${(container.scrollWidth - window.innerWidth) / 1.5}`,
      },
    });

    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  return (
    <section className="relative grid min-h-[90vh] grid-cols-1 gap-4 px-4 py-10 xl:grid-cols-2 xl:px-12 xl:py-16">
      {/* LEFT: BENEFITS SLIDER */}
      <div ref={containerRef} className="relative w-full overflow-hidden rounded-3xl shadow-lg">
        <div className="flex h-[65vh] w-max flex-row xl:h-[80vh]">
          {programs.map((p, i) => (
            <div
              key={i}
              className="benefit-card relative flex h-[65vh] w-[80vw] flex-col items-center justify-center bg-cover bg-center bg-no-repeat md:w-[60vw] xl:h-[80vh] xl:w-[50vw]"
              style={{ backgroundImage: `url(${p.bg})` }}
            >
              <div className="absolute inset-0 bg-black/30" />
              <div className="relative z-10 mx-4 max-w-md rounded-2xl bg-white/60 p-6 text-center shadow-lg backdrop-blur-md">
                <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white shadow">
                  {p.badge}
                </span>
                <div className="mb-3 flex justify-center">{p.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 md:text-2xl">{p.title}</h3>
                <p className="mb-2 text-xs italic text-gray-600">{p.subtitle}</p>
                <p className="mb-3 text-sm text-gray-700 md:text-base">{p.desc}</p>
                <Link
                  href={p.link}
                  className="inline-block rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white shadow hover:bg-primary/90"
                >
                  {p.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: FEATURED PRODUCTS */}
      <div className="flex flex-col justify-center rounded-3xl bg-gradient-to-br from-primary to-indigo-600 p-10 text-white shadow-lg">
        <div className="text-center xl:text-left">
          <h2 className="mb-3 text-2xl font-bold md:text-3xl">Sản Phẩm Nổi Bật</h2>
          <p className="mb-6 text-sm text-white/90 md:text-base">
            Những thiết bị được khách hàng lựa chọn nhiều nhất tháng này.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-2 xl:grid-cols-2">
          {['iPhone 16 Pro', 'MacBook M4', 'Dell XPS 14', 'Oppo Reno 14'].map((item, i) => (
            <div
              key={i}
              className="flex flex-col items-center rounded-2xl bg-white/10 p-5 text-center backdrop-blur-sm transition hover:bg-white/20"
            >
              <div className="mb-3 h-28 w-full rounded-xl bg-white/20" />
              <h3 className="text-sm font-semibold md:text-base">{item}</h3>
              <Link
                href="/san-pham"
                className="mt-2 text-xs font-medium text-white underline-offset-2 hover:underline"
              >
                Xem chi tiết
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center xl:text-left">
          <Link
            href="/san-pham"
            className="inline-block rounded-xl bg-white px-6 py-2 text-sm font-semibold text-primary shadow hover:bg-gray-100"
          >
            Xem tất cả sản phẩm
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
