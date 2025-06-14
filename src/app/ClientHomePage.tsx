'use client';

import HeaderResponsive from '@/components/userPage/HeaderResponsive';
import React from 'react';

export default function ClientHomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <HeaderResponsive Title_NavbarMobile="Trang Chủ" />
      <div className="fl ex-1 xl:pt-[130px]"></div>
    </div>
  );
}
