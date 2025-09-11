'use client';
import { useMemo } from 'react';
import * as THREE from 'three';
import lightConfig from './phoneLights.json';

// Kiểu dữ liệu thô (như JSON export từ viewer)
interface RawLight {
  r?: number;
  g?: number;
  b?: number;
  intensity?: number;
  Red?: number;
  Green?: number;
  Blue?: number;
  Intensity?: number;
}

// Kiểu dữ liệu sau khi normalize
interface NormalizedLight {
  r: number;
  g: number;
  b: number;
  intensity: number;
}

// Hàm normalize để chấp nhận cả key Viewer (Red/Green/Blue/Intensity) và key chuẩn (r/g/b/intensity)
function normalizeLight(obj: RawLight): NormalizedLight {
  return {
    r: obj.r ?? obj.Red ?? 0,
    g: obj.g ?? obj.Green ?? 0,
    b: obj.b ?? obj.Blue ?? 0,
    intensity: obj.intensity ?? obj.Intensity ?? 0,
  };
}

export default function SceneLights() {
  const lights = useMemo(() => {
    const c = {
      Light0: normalizeLight(lightConfig.Light0),
      Light1: normalizeLight(lightConfig.Light1),
      Light2: normalizeLight(lightConfig.Light2),
      Environment: normalizeLight(lightConfig.Environment),
    };

    return {
      l0: new THREE.Color(c.Light0.r / 255, c.Light0.g / 255, c.Light0.b / 255),
      l1: new THREE.Color(c.Light1.r / 255, c.Light1.g / 255, c.Light1.b / 255),
      l2: new THREE.Color(c.Light2.r / 255, c.Light2.g / 255, c.Light2.b / 255),
      env: new THREE.Color(c.Environment.r / 255, c.Environment.g / 255, c.Environment.b / 255),
      config: c,
    };
  }, []);

  return (
    <>
      {/* Directional Light */}
      <directionalLight color={lights.l0} intensity={lights.config.Light0.intensity / 100} position={[5, 5, 5]} />

      {/* Point Light */}
      <pointLight color={lights.l1} intensity={lights.config.Light1.intensity / 100} position={[-5, 5, -5]} />

      {/* Optional Light2 */}
      {lights.config.Light2.intensity > 0 && <pointLight color={lights.l2} intensity={lights.config.Light2.intensity / 100} position={[0, -3, 5]} />}

      {/* Hemisphere (Environment) */}
      <hemisphereLight color={lights.env} intensity={lights.config.Environment.intensity / 100} />
    </>
  );
}
