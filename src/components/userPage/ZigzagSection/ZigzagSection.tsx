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

// Preload GLTF để tối ưu
useGLTF.preload('/models/Phone.glb');

interface PhoneModelProps {
  scrollY: number;
  modelScale: number;
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

export default function ZigzagSection() {
  const [scroll, setScroll] = useState(0);
  const [modelScale] = useState(5); // Fixed scale cho desktop large

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

      <div className="relative h-[400vh] w-full">
        <Canvas
          style={{ position: 'sticky', top: '10%', height: '100vh', width: '100%' }}
          camera={{ position: [0, 0, modelScale * 2 + 5], fov: 5 }} // Fixed fov desktop
          gl={{ antialias: true }}
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
            <div className="relative mt-20 flex h-full w-full flex-col items-start justify-start px-desktop-padding">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="flex flex-col items-start gap-6"
              >
                {/* Badge */}
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-medium ring-1 ring-white/10 backdrop-blur-sm">
                  <span className="flex-shrink-0 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold">www.7Teck.vn</span>
                  <span className="uppercase">Ưu Đãi Trao Đổi</span>
                </div>
                {/* Headline */}
                <h1 className="text-5xl font-extrabold leading-tight text-white drop-shadow-md">
                  <span className="inline-flex gap-2">
                    Thu Cũ Đổi Mới
                    <IoShieldCheckmarkOutline className="text-green-400" />
                  </span>
                  <br />
                  Nhận Ngay Giá Tốt Nhất!
                </h1>
                {/* Subtitle / Extended content */}
                <p className="w-[50vw] text-xl text-slate-200/95">
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
                    Được tin dùng bởi hơn hàng trăm khách hàng công nghệ. Xem thêm{' '}
                    <Link className="italic underline" href="/hanh-trinh-khach-hang">
                      tại đây.
                    </Link>
                  </span>
                </div>
              </motion.div>
            </div>
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
        <section className="relative z-20 flex h-[100vh] w-full items-start justify-between px-desktop-padding">
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

        {/* Section 2: Camera */}
        <section className="relative z-20 flex h-[100vh] w-full items-start justify-center px-desktop-padding">
          <div className="flex w-full flex-row-reverse items-center">
            <div className="mb-4 w-1/2 text-left">
              <h1 className="mb-4 text-7xl font-bold">Camera Pro 48MP</h1>
              <p className="mb-4 text-2xl">Bộ 3 camera 48MP đồng bộ, zoom quang học 8x, quay video ProRes 8K chuyên nghiệp.</p>
              <p className="mb-4 text-sm italic text-gray-100 2xl:text-xl">
                Photonic Engine + AI giữ chi tiết và màu sắc nhất quán trên cả 3 ống kính, chụp đêm rõ ràng hơn bao giờ hết.
              </p>
              <p className="text-sm italic text-gray-100 2xl:text-xl">
                Camera trước 18MP với Center Stage, đảm bảo bạn luôn nổi bật trong mọi cuộc gọi video.
              </p>
            </div>
            <div className="relative w-1/2">{''}</div>
          </div>
        </section>

        {/* Section 3: Performance */}
        <section className="relative z-20 flex h-[100vh] items-start justify-center px-desktop-padding">
          <div className="flex w-full flex-row items-end">
            <div className="mb-4 w-1/2 text-left">
              <h1 className="mb-4 text-7xl font-bold">Hiệu năng A19 Pro</h1>
              <Image
                src={images.A19pro}
                alt="iPhone 17 Pro Max Chip"
                width={200}
                height={200}
                className="float-left mr-2 h-[200px] w-[200px] rounded-md object-contain"
              />
              <p className="mb-4 text-2xl">Chip A19 Pro tiến trình 2nm + 12GB RAM, sức mạnh vượt trội cho đa nhiệm, gaming và sáng tạo nội dung.</p>
              <p className="mb-4 text-sm italic text-gray-100 2xl:text-xl">
                GPU 6 nhân hỗ trợ ray tracing thời gian thực, chơi game AAA mượt mà, chỉnh sửa video 4K nhanh chóng.
              </p>
              <p className="text-sm italic text-gray-100 2xl:text-xl">
                Neural Engine thế hệ mới tăng tốc AI gấp đôi, trong khi pin tối ưu cho phép dùng thoải mái 2 ngày liên tục.
              </p>
            </div>
            <div className="relative w-1/2 p-2">{''}</div>
          </div>
        </section>
      </div>
    </div>
  );
}
