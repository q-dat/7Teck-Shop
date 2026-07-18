'use client';
import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { IoArrowUpCircleSharp } from 'react-icons/io5';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Button variant="unstyled"
      aria-label="Cuộn lên trên cùng"
      onClick={scrollToTop}
      className={`rounded-xs fixed bottom-[58px] left-1 z-header-mobile transform rounded-md border border-white bg-primary p-2 shadow-md transition-transform xl:bottom-5 xl:left-2 xl:hover:bg-primary xl:hover:bg-opacity-50 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
      }`}
    >
      <IoArrowUpCircleSharp className="text-2xl text-white" />
    </Button>
  );
};

export default ScrollToTopButton;
