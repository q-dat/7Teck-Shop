'use client';
import React, { useState, useEffect } from 'react';
import { IoArrowUpCircleSharp } from 'react-icons/io5';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      aria-label="Cuộn lên trên cùng"
      onClick={scrollToTop}
      className={`rounded-xs fixed bottom-[58px] left-1 z-[99999] transform rounded-md border border-white bg-primary p-2 shadow-md transition-transform xl:bottom-5 xl:left-2 xl:hover:bg-primary xl:hover:bg-opacity-50 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
      }`}
    >
      <IoArrowUpCircleSharp className="text-2xl text-white" />
    </button>
  );
};

export default ScrollToTopButton;
