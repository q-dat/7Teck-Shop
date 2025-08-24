'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const HeroBanner = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const btnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(titleRef.current, 
      { y: 80, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 1.2, ease: "power3.out" }
    );
    gsap.fromTo(subtitleRef.current, 
      { y: 50, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 1, delay: 0.3, ease: "power3.out" }
    );
    gsap.fromTo(btnRef.current, 
      { scale: 0.5, opacity: 0 }, 
      { scale: 1, opacity: 1, duration: 0.8, delay: 0.6, ease: "back.out(1.7)" }
    );
  }, []);

  return (
    <section className="relative flex h-[90vh] items-center justify-center bg-black text-white">
      <div className="text-center space-y-4">
        <h1 ref={titleRef} className="text-4xl font-extrabold xl:text-6xl">
          Khám Phá Công Nghệ Đỉnh Cao
        </h1>
        <p ref={subtitleRef} className="text-lg font-light text-white/80">
          Sản phẩm chính hãng, giá tốt nhất thị trường
        </p>
        <div ref={btnRef}>
          <button className="mt-5 rounded-md bg-primary px-6 py-3 font-medium shadow-lg hover:scale-105 transition">
            Mua Ngay
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
