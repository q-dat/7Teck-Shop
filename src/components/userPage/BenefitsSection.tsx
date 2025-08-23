// 'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FaShippingFast, FaShieldAlt, FaTags } from 'react-icons/fa';
import { images } from '../../../public/images';

gsap.registerPlugin(ScrollTrigger);

const benefits = [
  {
    icon: <FaShippingFast className="text-6xl text-primary" />,
    title: 'Giao Hàng Nhanh',
    desc: 'Miễn phí nội thành TP.HCM - Hỗ trợ giao các tỉnh lân cận',
    bg: `${images.Popup}`,
  },
  {
    icon: <FaShieldAlt className="text-6xl text-primary" />,
    title: 'Bảo Hành Uy Tín',
    desc: 'Bảo hành chính hãng, hỗ trợ 1 đổi 1',
    bg: `${images.Popup}`,
  },
  {
    icon: <FaTags className="text-6xl text-primary" />,
    title: 'Khuyến Mãi Hấp Dẫn',
    desc: 'Giảm giá lên tới 50% cho các sản phẩm hot',
    bg: `${images.Popup}`,
  },
  {
    icon: <FaShippingFast className="text-6xl text-primary" />,
    title: 'Hỗ Trợ 24/7',
    desc: 'Đội ngũ tư vấn online bất cứ khi nào bạn cần',
    bg: `${images.Popup}`,
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
        scrub: 1,
        start: 'center center',
        end: () => `+=${container.scrollWidth - window.innerWidth}`,
      },
    });
  }, []);

  return (
    <section ref={containerRef} className="relative my-10 w-full overflow-hidden">
      <div className="flex h-[100vh] w-max flex-row">
        {benefits.map((b, i) => (
          <div
            key={i}
            className="benefit-card relative flex w-screen flex-col items-center justify-center bg-cover bg-center bg-no-repeat text-center"
            style={{
              backgroundImage: `url(${b.bg})`,
            }}
          >
            <div className="absolute inset-0 w-full" />
            <p> {b.icon}</p>
            <div className="relative z-10 text-white">
              <h3 className="text-5xl font-bold">{b.title}</h3>
              <p className="text-6xl">{b.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BenefitsSection;
