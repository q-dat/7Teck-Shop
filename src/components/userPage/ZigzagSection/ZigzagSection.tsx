'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { RiScrollToBottomLine } from 'react-icons/ri';
import { images } from '../../../../public/images';
import SceneLights from './SceneLights';
import Link from 'next/link';
import { IoShieldCheckmarkOutline } from 'react-icons/io5';
import { IPhone } from '@/types/type/products/phone/phone';
import { useImageErrorHandler } from '@/hooks/useImageErrorHandler';
import imageRepresent from '../../../../public/image-represent';
import { useScroll } from '@/hooks/useScroll';
import ProductPlaceholders from '../ProductPlaceholders';
import { slugify } from '@/utils/slugify';
import { FaCartPlus, FaRegEye } from 'react-icons/fa';
import { formatCurrency } from '@/utils/formatCurrency';
import { MdArrowBackIosNew, MdArrowForwardIos, MdNavigateNext } from 'react-icons/md';
// import Section1 from './Section1';
// import Section2 from './Section2';
// import Section3 from './Section3';

// Preload GLTF để tối ưu
useGLTF.preload('/models/Phone.glb');

interface PhoneModelProps {
  scrollY: number;
  modelScale: number;
}
interface ClientPhoneProps {
  mostViewedPhones: IPhone[];
  loading: boolean;
}
function PhoneModel({ scrollY, modelScale }: PhoneModelProps) {
  const { scene } = useGLTF('/models/Phone.glb');
  const ref = useRef<THREE.Group>(null);
  const dirX = useRef(1);
  const speed = 0.01;

  const { viewport } = useThree();

  useFrame(() => {
    if (!ref.current) return;

    const sections = 6;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const progress = Math.min(scrollY / maxScroll, 1);
    const currentSection = Math.floor(progress * sections);
    const sectionProgress = (progress * sections) % 1;

    ref.current.scale.set(modelScale, modelScale, modelScale);

    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, progress * Math.PI * 3, 0.3);
    ref.current.rotation.x = Math.sin(progress * Math.PI * 4) * 0.15;
    ref.current.rotation.z = Math.sin(progress * Math.PI * 2) * 0.1;

    const amplitude = 1.8; // Fixed cho desktop

    let x = 0,
      y = 0;
    if (currentSection === 0) {
      x = -amplitude * sectionProgress; // Sang trái
      y = 0;
    } else if (currentSection === 1) {
      x = -amplitude + amplitude * 2 * sectionProgress; // Qua phải
      y = 0;
    } else if (currentSection === 2) {
      x = amplitude - amplitude * 2 * sectionProgress; // Qua trái lại
      y = amplitude * sectionProgress; // Lên trên
    } else if (currentSection === 3) {
      x = -amplitude + amplitude * 2 * sectionProgress; // Qua phải lại
      y = amplitude - amplitude * sectionProgress; // Xuống dưới
    } else if (currentSection === 4) {
      x = amplitude - amplitude * 2 * sectionProgress; // Qua trái
      y = -amplitude * sectionProgress; // Xuống dưới thêm
    } else if (currentSection === 5) {
      x = -amplitude + amplitude * 2 * sectionProgress; // Qua phải về center
      y = -amplitude + amplitude * sectionProgress; // Lên về 0
    }

    const margin = 0.5;
    const maxX = viewport.width / 2.5 - margin;
    const minX = -maxX;

    if (x >= maxX) dirX.current = -1;
    if (x <= minX) dirX.current = 1;

    x += dirX.current * speed;

    ref.current.position.set(THREE.MathUtils.clamp(x, minX, maxX), y, 0);
  });

  return <primitive ref={ref} object={scene} />;
}

export default function ZigzagSection({ mostViewedPhones, loading }: ClientPhoneProps) {
  const [scroll, setScroll] = useState(0);
  const [modelScale] = useState(5); // Fixed scale cho desktop large
  const basePath = 'dien-thoai';
  const { scrollRef, isLeftVisible, isRightVisible, hasOverflow, scrollBy } = useScroll();
  //  handleImageError
  const fallbackSrc = imageRepresent.Fallback;
  const { handleImageError, isImageErrored } = useImageErrorHandler();

  useEffect(() => {
    const onScroll = () => setScroll(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });

    const handleResize = () => {
      // Chỉ update nếu cần cho desktop variants, nhưng fixed scale
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="relative hidden w-full bg-gradient-to-b from-gray-950 via-black to-gray-950 text-white xl:block">
      <div className="absolute inset-0 bg-gradient-to-tr from-[#009485]/20 via-transparent to-[#a92d30]/20" />
      <div className="relative h-[85vh] w-full 2xl:h-[400vh]">
        <Canvas
          className="hidden 2xl:block"
          style={{ position: 'sticky', top: '10%', height: '100vh', width: '100%' }}
          camera={{ position: [0, 0, modelScale * 2 + 5], fov: 5 }} // Fixed fov desktop
          gl={{
            antialias: true,
            powerPreference: 'high-performance',
            alpha: true,
            stencil: false,
            depth: true,
          }}
          dpr={[1, 2]} // cho màn hình retina tự tối ưu
        >
          <SceneLights />
          <PhoneModel scrollY={scroll} modelScale={modelScale} />
        </Canvas>

        {/* Overlay cho section đầu */}
        <div className="absolute left-0 top-0 z-20 flex h-[100vh] w-full items-start justify-center">
          {/* Banner */}
          <header className="relative h-[85vh] w-full overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
            {/* Background image */}
            <div className="pointer-events-none absolute inset-0">
              <Image
                src={images.MacProM4}
                alt="Hero background"
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="scale-105 transform-gpu object-cover object-center opacity-60 will-change-transform"
                priority
              />
              <div className="via-defrom-default/20 absolute inset-0 bg-gradient-to-t from-default/70 to-transparent" />
            </div>
            {/* Content */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: 'easeOut' }}>
              <div className="relative mt-20 flex h-full w-full flex-row items-start justify-start gap-1 px-desktop-padding">
                {/* Text Content */}
                <div className="flex w-full flex-col items-start gap-6">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-medium ring-1 ring-white/10 backdrop-blur-sm">
                    <span className="flex-shrink-0 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold">www.7Teck.vn</span>
                    <span className="uppercase">Ưu Đãi Trao Đổi</span>
                  </div>
                  {/* Headline */}
                  <h1 className="text-5xl font-extrabold leading-tight text-white drop-shadow-md 2xl:text-6xl">
                    <span className="inline-flex items-center justify-center gap-2">
                      Thu Cũ Đổi Mới
                      <IoShieldCheckmarkOutline className="text-green-400" />
                    </span>
                    <br />
                    Nhận Ngay Giá Tốt Nhất!
                  </h1>
                  {/* Subtitle / Extended content */}
                  <p className="text-lg text-slate-200/95 2xl:text-xl">
                    Đổi điện thoại cũ lấy siêu phẩm mới với mức giá hấp dẫn.
                    <br />
                    Giải pháp thông minh để bạn nâng cấp thiết bị yêu thích ngay hôm nay.
                    <br />
                    Lên đến <i className="text-4xl font-bold text-yellow-300">90%</i> giá trị sản phẩm - uy tín, nhanh chóng, minh bạch, tiện lợi.
                  </p>
                  {/* CTA */}
                  <div className="mt-2 flex flex-wrap gap-4 uppercase">
                    <Link
                      href="/bang-gia-thu-mua"
                      className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-md ring-1 ring-white/30 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 hover:scale-[1.05]"
                      aria-label="Mua ngay"
                    >
                      Điều Kiện Áp Dụng
                    </Link>

                    <Link
                      href="/dien-thoai"
                      className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm text-white/90 ring-1 ring-white/10 transition-colors hover:bg-white/5"
                    >
                      Điện Thoại New Seal - Chính Hãng
                    </Link>
                  </div>
                  {/* Extra info */}
                  <div className="w-full">
                    <span className="text-sm text-slate-200/80">
                      Được tin dùng bởi hơn hàng trăm khách hàng công nghệ. Xem thêm
                      <Link className="italic underline" href="/hanh-trinh-khach-hang">
                        tại đây.
                      </Link>
                    </span>
                  </div>
                </div>

                {/* Outstanding product */}
                <div className="relative w-1/2">
                  {/* Featured phones carousel */}
                  <div className="flex flex-row items-center justify-between">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-medium ring-1 ring-white/10 backdrop-blur-sm">
                      <span className="flex-shrink-0 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold">Điện thoại</span>
                      <span className="uppercase">Sản Phẩm Nổi Bật</span>
                    </div>
                    {/* View More */}
                    <div className="inline-flex items-center justify-center rounded-full bg-white/10 px-4 py-1 font-medium ring-1 ring-white/10 backdrop-blur-sm">
                      <Link className="text-xs" href="/dien-thoai">
                        Xem Thêm
                      </Link>
                      <MdNavigateNext className="text-xl" />
                    </div>
                  </div>
                  {/* Product List */}
                  <section
                    ref={scrollRef}
                    className="mt-6 grid w-full grid-flow-col grid-rows-1 items-center justify-start gap-[10px] overflow-x-auto scroll-smooth rounded-md pt-0 scrollbar-hide"
                  >
                    {loading ? (
                      <ProductPlaceholders count={12} />
                    ) : (
                      mostViewedPhones.map((phone) => {
                        const phoneUrl = slugify(phone?.name);
                        const isErrored = isImageErrored(phone?._id);
                        const src = isErrored || !phone?.img ? fallbackSrc : phone?.img;

                        return (
                          <div
                            key={phone?._id}
                            className="group relative flex h-full w-[240px] flex-col justify-between rounded-md border border-primary-lighter text-white"
                          >
                            {/* Product Image */}
                            <Link aria-label="Xem chi tiết sản phẩm khi ấn vào hình ảnh" href={`/dien-thoai/${phoneUrl}/${phone?._id}`}>
                              <div className="h-[240px] w-full cursor-pointer overflow-hidden rounded-md rounded-b-none bg-white">
                                <Image
                                  height={240}
                                  width={240}
                                  alt="Hình ảnh"
                                  loading="lazy"
                                  className="h-full w-full rounded-[5px] rounded-b-none object-contain transition-transform duration-1000 ease-in-out group-hover:scale-110"
                                  src={src}
                                  onError={() => handleImageError(phone?._id)}
                                />
                              </div>
                            </Link>
                            {/* Product Info */}
                            <div className="flex h-full w-full flex-col items-start justify-between rounded-b-md bg-white/10 p-1 group-hover:bg-default/50">
                              {/* Product Name and View Count */}
                              <div className="w-full text-white">
                                <Link
                                  aria-label="Xem chi tiết sản phẩm khi nhấn vào tên sản phẩm"
                                  className="w-full cursor-pointer"
                                  href={`/dien-thoai/${phoneUrl}/${phone?._id}`}
                                >
                                  <div className="flex w-[50px] items-center justify-start gap-1 rounded-sm p-[2px] text-center text-[12px]">
                                    <FaRegEye />
                                    <p>{phone?.view}</p>
                                  </div>
                                  <p className="text-prod-name-desktop font-medium">
                                    Điện Thoại&nbsp;
                                    {phone?.name}
                                  </p>
                                </Link>
                              </div>
                              {/* Product Specifications */}
                              <div className="flex flex-wrap items-center justify-start gap-2 text-xs">
                                {[{ value: phone?.color }, { label: 'RAM', value: phone?.phone_catalog_id?.configuration_and_memory?.ram }].map(
                                  (item, index) => (
                                    <p key={index} className="y-1 rounded-xl bg-primary-lighter px-2 text-default">
                                      {item.value ? (
                                        <>
                                          <span className="font-semibold">{item.label ? `${item.label}: ` : ''}</span>

                                          <span className="font-light">{item.value}</span>
                                        </>
                                      ) : null}
                                    </p>
                                  )
                                )}
                              </div>

                              {/* Price and Buy Button */}
                              <div className="w-full">
                                <p className="text-lg">
                                  <span className="font-semibold text-white group-hover:text-white">{formatCurrency(phone?.price)}</span> &nbsp;
                                  {phone?.sale && <del className="text-xs font-light text-white">{formatCurrency(phone?.sale)}</del>}
                                </p>
                              </div>
                            </div>

                            {/* Status Tag */}
                            {phone?.status && (
                              <div className="absolute left-0 top-0 z-20 flex w-full flex-row items-center justify-between px-0.5 py-px">
                                {/* Status */}
                                {/* <div className="relative">
                                  <Image height={100} width={60} alt="" loading="lazy" className="h-full w-[60px]" src={imageRepresent.Status} />
                                  <p className="absolute top-0 w-full pl-2 text-sm font-medium text-white">{phone?.status}</p>
                                </div> */}
                                <span className="rounded-lg bg-primary px-1 text-xs text-white">{phone?.status}</span>
                                {/* Add To Cart */}
                                <button
                                  onClick={() => {
                                    const productToBuy = {
                                      _id: phone?._id,
                                      name: phone?.name,
                                      img: phone?.img,
                                      price: phone?.price,
                                      ram: phone?.phone_catalog_id?.configuration_and_memory?.ram,
                                      color: phone?.color,
                                      link: `${basePath}/${slugify(phone?.name)}/${phone?._id}`,
                                    };
                                    localStorage.setItem('selectedProduct', JSON.stringify(productToBuy));
                                    window.location.href = '/thanh-toan';
                                  }}
                                >
                                  <FaCartPlus className="text-xl text-primary" />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </section>

                  {/* Navigation Button */}
                  {!loading && mostViewedPhones.length > 0 && (hasOverflow || mostViewedPhones.length > 12) && (
                    <div className="absolute top-1/2 flex w-full items-center justify-between">
                      <div className="relative w-full">
                        <button
                          aria-label="Cuộn sang trái"
                          onClick={() => scrollBy(-450)}
                          className={`absolute left-0 z-[100] -translate-y-1/2 rounded-full border border-gray-400 bg-white p-2 text-black shadow transition-transform duration-200 hover:scale-110 ${
                            isLeftVisible ? '' : 'hidden'
                          }`}
                        >
                          <MdArrowBackIosNew className="text-2xl" />
                        </button>
                        <button
                          aria-label="Cuộn sang phải"
                          onClick={() => scrollBy(450)}
                          className={`absolute right-0 z-[100] -translate-y-1/2 rounded-full border border-gray-400 bg-white p-2 text-black shadow transition-transform duration-200 hover:scale-110 ${
                            isRightVisible ? '' : 'hidden'
                          }`}
                        >
                          <MdArrowForwardIos className="text-2xl" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
            {/* Scroll Indicator */}
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="flex items-center justify-center"
              >
                <RiScrollToBottomLine className="text-5xl text-white opacity-100 drop-shadow-lg transition-transform duration-300 hover:scale-125" />
              </motion.div>
            </div>
          </header>
        </div>
        {/* Section 1: Intro */}
        {/* <Section1 /> */}
        {/* Section 2: Camera */}
        {/* <Section2 /> */}
        {/* Section 3: Performance */}
        {/* <Section3 /> */}
      </div>
    </div>
  );
}
