'use client';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { images } from '../../../../public/images';

export default function Section1() {
  const [scroll, setScroll] = useState(0);
  useEffect(() => {
    const onScroll = () => setScroll(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  });
  return (
    <section className="relative z-20 hidden h-[100vh] w-full px-desktop-padding 2xl:block">
      <div className="flex w-full flex-row items-start">
        <div className="mb-4 w-1/2 text-left">
          <h1 className="mb-6 text-7xl font-extrabold">iPhone 17 Pro Max</h1>
          <p className="mb-4 text-2xl">Siêu phẩm 2025: màn hình 6.9&quot; Super Retina XDR, chip A19 Pro và camera Pro 48MP toàn diện.</p>
          <p className="text-xl text-gray-300">
            Thiết kế khung nhôm sang trọng, màu sắc mới mẻ, pin kỷ lục đến 37 giờ video cùng kết nối Wi-Fi 7, USB-C tốc độ cao.
          </p>
        </div>
        <div className="relative flex w-1/2 flex-row items-center justify-center overflow-hidden rounded-md">
          <Image
            src={images.Ip17PM}
            alt="iPhone 17 Pro Max"
            width={400}
            height={500}
            className="h-full w-full transform rounded-md object-contain transition-transform duration-700 ease-out"
            style={{ transform: `translateY(${Math.max(scroll * 0.2 - 100, -50)}px)` }}
          />
        </div>
      </div>
    </section>
  );
}
