'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import SceneLights from './SceneLights';
import BannerDesktop from '../BannerDesktop';
import { IPhone } from '@/types/type/products/phone/phone';

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
      {/* Banner */}

      {/* Chỉnh lại height cho phù hợp nội dung */}
      {/* <div className="relative h-[85vh] w-full 2xl:h-[400vh]">  */}
      <div className="relative h-[85vh] w-full">
        <Canvas
          // className="hidden 2xl:block" // Chỉ hiển thị trên desktop lớn
          className="hidden"
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
          <BannerDesktop mostViewedPhones={mostViewedPhones} loading={loading} />
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
