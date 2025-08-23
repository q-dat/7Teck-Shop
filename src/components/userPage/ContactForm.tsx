'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaFacebookMessenger, FaCommentDots } from 'react-icons/fa';
import { images } from '../../../public/images';
import { messengerUrl, zaloUrl } from '@/utils/socialLinks';
import ChatBot from '../chatbot/ChatBot';
import { IoCloseSharp } from 'react-icons/io5';

const ContactForm: React.FC = () => {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className="w-full">
      {/* Overlay */}
      {!collapsed && <div className="fixed inset-0 z-[99998] bg-[#000000]/60" onClick={() => setCollapsed(true)} />}

      {/* Panel liên hệ */}
      <div className="fixed bottom-[58px] right-1 z-[99999] space-y-2 pl-1 xl:bottom-5 xl:right-2">
        {collapsed ? (
          <div className="flex flex-col items-end gap-1">
            {/* Nút mở liên hệ nhanh */}
            <button
              onClick={() => setCollapsed(false)}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg"
              aria-label="Mở liên hệ nhanh"
            >
              <FaCommentDots className="h-6 w-6" />
            </button>
            {/* WaveText */}
            <style jsx>{`
              @keyframes wave {
                0%,
                100% {
                  transform: translateY(0);
                }
                50% {
                  transform: translateY(-3px);
                }
              }

              .wave-text span {
                display: inline-block;
                animation: wave 1s ease-in-out infinite;
              }
            `}</style>
            <span className="wave-text mb-1 select-none rounded-md border border-dashed border-primary/70 bg-primary-lighter p-[3px] text-[10px] font-medium text-primary">
              {`Liên Hệ Nhanh`.split('').map((char, i) => (
                <span key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-end gap-2" onClick={() => setCollapsed(true)}>
            {/* ChatBot: không đóng khi click */}
            <div onClick={(e) => e.stopPropagation()}>
              <ChatBot />
            </div>

            {/* Messenger: đóng khi click */}
            <Link
              title="Liên hệ qua Messenger"
              target="_blank"
              href={messengerUrl}
              aria-label="Liên hệ qua Messenger"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex h-[45px] w-[45px] items-center justify-center rounded-full bg-gradient-to-tl from-[#1f6bf6] via-white to-transparent shadow-md xl:h-[50px] xl:w-[50px]">
                <FaFacebookMessenger className="text-[35px] text-[#1f6bf6] xl:text-[40px]" />
              </div>
            </Link>

            {/* Zalo: đóng khi click */}
            <Link title="Liên hệ qua Zalo" target="_blank" href={zaloUrl} aria-label="Liên hệ qua Zalo" onClick={(e) => e.stopPropagation()}>
              <Image
                width={45}
                height={45}
                src={images.LogoZalo}
                alt="Zalo"
                className="h-full w-[45px] animate-zoomBorderBtn rounded-full xl:w-[50px]"
              />
            </Link>

            {/* Nút thu gọn */}
            <div className="fixed bottom-24 left-1/2 z-[99999] -translate-x-1/2">
              <button className="rounded-full border border-white bg-black/60 p-1 shadow-xl" onClick={() => setCollapsed(true)}>
                <IoCloseSharp className="text-4xl text-white" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactForm;
