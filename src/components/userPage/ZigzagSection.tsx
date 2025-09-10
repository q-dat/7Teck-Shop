'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { RiScrollToBottomLine } from 'react-icons/ri';
import { images } from '../../../public/images';

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
          <ambientLight intensity={1.2} />
          <directionalLight position={[5, 5, 5]} intensity={1.8} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.5} />
              <PhoneModel scrollY={scroll} modelScale={modelScale} />
            </Canvas>
        {/* Overlay cho section đầu */}
        <div className="pointer-events-none absolute left-0 top-10 z-20 flex h-[100vh] w-full items-start justify-center">
          <div className="absolute left-0 top-0 flex h-screen w-full items-start justify-center">
            <div className="rounded-3xl bg-default/20 p-10 shadow-2xl backdrop-blur-lg">
              {/* Phần 1: Giới thiệu */}
              <div className="mb-8 text-center">
                <h2 className="mb-4 text-6xl font-extrabold text-gray-100 drop-shadow-lg">Khám phá iPhone 17 Pro Max</h2>
                <p className="text-2xl italic text-gray-200">Thiết kế titan siêu bền. Camera đột phá. Hiệu năng vượt trội.</p>
              </div>

              {/* Phần 2: Thương hiệu / CTA */}
              <div className="border-t border-gray-300/30 pt-6 text-center">
                <p className="text-xl text-gray-300">
                  Trải nghiệm ngay tại <span className="font-semibold text-white underline">www.7teck.vn</span>
                </p>
                <p className="mt-2 text-xl font-medium text-gray-200">Nơi công nghệ hội tụ - Khẳng định đẳng cấp.</p>
              </div>
              <div className="mt-10">
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
            </div>
          </div>

          {/* Scroll Indicator */}
        </div>

        {/* Section 1: Intro */}
        <section className="relative z-20 flex h-[100vh] w-full items-start justify-between px-desktop-padding">
          <div className="flex w-full flex-row items-center">
            <div className="mb-4 w-1/2 text-left">
              <h1 className="mb-6 text-7xl font-extrabold">iPhone 17 Pro Max</h1>
              <p className="mb-4 text-2xl">Trải nghiệm đỉnh cao với chip A19 Pro, camera 48MP cải tiến và thiết kế titan siêu bền.</p>
              <p className="text-xl text-gray-300">Kết hợp sức mạnh công nghệ và sự tinh xảo, mang đến trải nghiệm khác biệt.</p>
            </div>
            <div className="relative flex w-1/2 flex-row items-center justify-center overflow-hidden rounded-md">
              <Image
                src={images.Ip17PM}
                alt="iPhone 17 Pro Max"
                width={400}
                height={500}
                className="h-full w-full transform rounded-md object-contain transition-transform duration-700 ease-out"
                style={{ transform: `translateY(${Math.max(scroll * 0.2 - 200, -50)}px)` }}
              />
            </div>
          </div>
        </section>
        {/* Section 2: Camera */}
        <section className="relative z-20 flex h-[100vh] w-full items-start justify-center px-desktop-padding">
          <div className="flex w-full flex-row-reverse items-center">
            <div className="mb-4 w-1/2 text-left">
              <h1 className="mb-4 text-7xl font-bold">Camera 48MP</h1>
              <p className="mb-4 text-2xl">Hệ thống camera sau triple 48MP với zoom quang 8x, hỗ trợ quay video 8K và chế độ đêm cải tiến.</p>
              <p className="mb-4 text-sm italic text-gray-100 2xl:text-xl">
                Với cảm biến thế hệ mới, iPhone 17 Pro Max mang lại khả năng chụp ảnh cực kỳ sắc nét, màu sắc trung thực ngay cả trong điều kiện thiếu
                sáng.
              </p>
              <p className="mb-4 text-sm italic text-gray-100 2xl:text-xl">
                Tính năng Photonic Engine kết hợp cùng thuật toán AI giúp xử lý chi tiết nhanh chóng, hạn chế nhiễu và giữ lại độ sâu trường ảnh tự
                nhiên.
              </p>
              <p className="text-sm italic text-gray-100 2xl:text-xl">
                Ngoài ra, chế độ quay video chuyên nghiệp ProRes 8K mở ra trải nghiệm điện ảnh trên smartphone, đáp ứng nhu cầu của cả nhà sáng tạo
                nội dung lẫn người dùng phổ thông.
              </p>
            </div>
            <div className="relative w-1/2">{''}</div>
          </div>
        </section>
        {/* Section 3: Performance */}
        <section className="relative z-20 flex h-[100vh] items-start justify-center px-desktop-padding">
          <div className="flex w-full flex-row items-end">
            <div className="mb-4 w-1/2 text-left">
              <h1 className="mb-4 text-7xl font-bold">Hiệu năng A19 Pro </h1>
              <Image
                src={images.A19pro}
                alt="iPhone 17 Pro Max Chip"
                width={200}
                height={200}
                className="float-left mr-2 h-[200px] w-[200px] rounded-md object-contain"
              />
              <p className="mb-4 text-2xl">Chip A19 Pro với 12GB RAM mang lại tốc độ vượt trội, tiết kiệm năng lượng và hỗ trợ AI tối ưu.</p>
              <p className="mb-4 text-sm italic text-gray-100 2xl:text-xl">
                Được sản xuất trên tiến trình 2nm tiên tiến, A19 Pro nâng tầm hiệu năng xử lý, cho khả năng đa nhiệm mượt mà và phản hồi tức thì trong
                mọi tác vụ.
              </p>
              <p className="mb-4 text-sm italic text-gray-100 2xl:text-xl">
                GPU thế hệ mới đem lại trải nghiệm chơi game đỉnh cao, đồ họa sắc nét cùng khả năng xử lý ray tracing thời gian thực.
              </p>
              <p className="mb-4 text-sm italic text-gray-100 2xl:text-xl">
                Công nghệ Neural Engine cải tiến tăng tốc độ xử lý AI gấp đôi, từ nhận diện hình ảnh, giọng nói đến tối ưu hoá ứng dụng hằng ngày.
              </p>
              <p className="text-sm italic text-gray-100 2xl:text-xl">
                Hiệu suất mạnh mẽ nhưng vẫn tiết kiệm pin, đảm bảo người dùng có thể làm việc, giải trí và sáng tạo cả ngày dài mà không lo gián đoạn.
              </p>
            </div>
            <div className="relative w-1/2 p-2">{''}</div>
          </div>
        </section>
      </div>
    </div>
  );
}
