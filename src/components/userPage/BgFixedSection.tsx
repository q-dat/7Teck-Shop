'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { images } from '../../../public/images';

gsap.registerPlugin(ScrollTrigger);

const BgFixedSection = () => {
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
            start: 'top 80%',
            end: 'bottom 50%',
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
            start: 'top 85%',
            end: 'bottom 50%',
            scrub: true,
          },
        }
      );
    }
  }, []);

  return (
    <div
      className="relative my-10 h-[200px] w-full bg-cover bg-fixed bg-center bg-no-repeat xl:h-[300px]"
      style={{ backgroundImage: `url(${images.bgFixed})` }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 px-2 text-lg font-light text-white xl:px-desktop-padding xl:text-3xl">
        <h2 ref={titleRef} className="font-semibold">
          iPhone 16 Pro Max
        </h2>
        <p ref={descRef} className="text-center">
          Trải nghiệm công nghệ đỉnh cao với thiết kế mới mẻ, hiệu suất vượt trội và camera siêu nét.
        </p>
      </div>
    </div>
  );
};

export default BgFixedSection;
