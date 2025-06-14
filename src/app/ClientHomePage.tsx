'use client';
import ScrollToTopButton from '@/components/orther/scrollToTop/ScrollToTopButton';
import ContactForm from '@/components/UserPage/ContactForm';
import HeaderResponsive from '@/components/UserPage/HeaderResponsive';
import NavBottom from '@/components/UserPage/NavBottom';
import NotificationPopup from '@/components/UserPage/NotificationPopup';
import FooterFC from '@/components/UserPage/ui/Footer';
import Header from '@/components/UserPage/ui/Header';
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
