'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { images } from '../../../public/images';
import Link from 'next/link';

gsap.registerPlugin(ScrollTrigger);
interface BgFixedSectionProps {
  className?: string;
}
const BgFixedSection: React.FC<BgFixedSectionProps> = ({ className = '' }) => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (titleRef.current && descRef.current) {
      // Title giống uk-parallax
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: -50, scale: 2 },
        {
          opacity: 0.9,
          y: 0,
          scale: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: titleRef.current,
            start: 'top bottom',
            end: '+=85%',
            scrub: true,
          },
        }
      );

      // Desc giống uk-parallax
      gsap.fromTo(
        descRef.current,
        { opacity: 0, y: 50, scale: 0.5 },
        {
          opacity: 0.9,
          y: 0,
          scale: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: descRef.current,
            start: 'top bottom',
            end: '+=85%',
            scrub: true,
          },
        }
      );
    }
  }, []);

  return (
    <div
      className={`relative my-10 h-[200px] w-full bg-cover bg-fixed bg-center bg-no-repeat md:h-[300px] xl:h-[400px] ${className}`}
      style={{ backgroundImage: `url(${images.bgFixed})` }}
    >
      <div className="absolute inset-0 flex w-full flex-col items-center justify-center overflow-hidden bg-black/30 font-light text-white">
        {/* Title  */}
        <h2
          ref={titleRef}
          className="whitespace-nowrap py-2 text-4xl font-semibold text-[#fffaf6] [text-shadow:1px_1px_0_black,-1px_1px_0_black,1px_-1px_0_black,-1px_-1px_0_black,0_0_6px_rgba(255,140,0,1),0_0_12px_rgba(255,160,50,0.9)] [text-stroke-color:black] [text-stroke-width:1px] xl:text-7xl"
        >
          iPhone 16 Series
        </h2>
        {/* Desc */}
        <div ref={descRef} className="flex flex-col items-center justify-center gap-2">
          <p className="/*[-webkit-text-stroke:1px_black] [text-stroke-width:1px]*/ w-full break-words px-2 text-center text-sm font-light text-white [text-stroke-color:black] md:text-xl xl:w-4/5 xl:px-desktop-padding xl:text-3xl">
            Với chip A18 mạnh mẽ, camera Pro <span className="font-bold">48MP</span> và thiết kế tinh xảo,
            <span className="font-bold">iPhone 16 Series</span> tiếp tục khẳng định đẳng cấp và mang đến trải nghiệm mượt mà cho mọi nhu cầu.
          </p>
          {/* Button */}
          <div className="pt-4">
            <Link
              href="/dien-thoai/iphone-16-series"
              aria-label="Xem chi tiết iPhone 16 Series"
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-white/30 bg-white/10 px-8 py-3 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md transition-all duration-500 hover:bg-white hover:text-black xl:px-12 xl:py-4 xl:text-sm"
            >
              <span className="relative z-10">Khám phá chi tiết</span>
              <div className="absolute inset-0 z-0 translate-y-[100%] bg-white transition-transform duration-500 group-hover:translate-y-0" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BgFixedSection;
