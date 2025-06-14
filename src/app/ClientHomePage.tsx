'use client';
import ScrollToTopButton from '@/components/orther/scrollToTop/ScrollToTopButton';
import ContactForm from '@/components/userPage/ContactForm';
import HeaderResponsive from '@/components/userPage/HeaderResponsive';
import NavBottom from '@/components/userPage/NavBottom';
import NotificationPopup from '@/components/userPage/NotificationPopup';
import FooterFC from '@/components/userPage/ui/Footer';
import Header from '@/components/userPage/ui/Header';

import React from 'react';

export default function ClientHomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <HeaderResponsive Title_NavbarMobile="Trang Chủ" />
      <ScrollToTopButton />
      <div className="fl ex-1 xl:pt-[130px]"></div>
      <NotificationPopup />
      <ContactForm />
      <FooterFC />
      <NavBottom />
    </div>
  );
}
