'use client';
import React from 'react';
import ScrollToTopButton from './components/orther/scrollToTop/ScrollToTopButton';
import ContactForm from './components/UserPage/ContactForm';
import FooterFC from './components/UserPage/Footer';
import Header from './components/UserPage/Header';
import NavBottom from './components/UserPage/NavBottom';
import NotificationPopup from './components/UserPage/NotificationPopup';
import HeaderResponsive from './components/UserPage/HeaderResponsive';

export default function ClientHomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-primary-white">
      <Header />
      <HeaderResponsive Title_NavbarMobile="Trang Chủ" />
      <ScrollToTopButton />
      <div className="flex-1 xl:pt-[130px]"></div>
      <NotificationPopup />
      <ContactForm />
      <FooterFC />
      <NavBottom />
    </div>
  );
}
