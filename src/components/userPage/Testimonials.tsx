'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const Testimonials = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const cards = sectionRef.current.querySelectorAll('.testimonial');
    if (cards.length === 0) return;

    gsap.from(cards, {
      y: 100,
      opacity: 0,
      duration: 1,
      stagger: 0.3,
      ease: 'power3.out',
    });
  }, []);

  return (
    <section ref={sectionRef} className="my-16 bg-gray-100 py-10">
      <h2 className="mb-6 text-center text-2xl font-bold">Khách Hàng Nói Gì</h2>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 md:grid-cols-3">
        <div className="testimonial rounded-lg bg-white p-5 shadow-md">
          <p>“Sản phẩm chất lượng, giao hàng siêu nhanh!”</p>
          <span className="mt-2 block text-sm font-semibold text-primary">Nguyễn Văn A</span>
        </div>
        <div className="testimonial rounded-lg bg-white p-5 shadow-md">
          <p>“Đổi trả dễ dàng, hỗ trợ tận tình.”</p>
          <span className="mt-2 block text-sm font-semibold text-primary">Trần Thị B</span>
        </div>
        <div className="testimonial rounded-lg bg-white p-5 shadow-md">
          <p>“Giá rẻ hơn so với cửa hàng khác mà vẫn chính hãng.”</p>
          <span className="mt-2 block text-sm font-semibold text-primary">Lê Văn C</span>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
