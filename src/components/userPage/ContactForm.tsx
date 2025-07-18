'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaFacebookMessenger } from 'react-icons/fa';
import { images } from '../../../public/images';
import { messengerUrl, zaloUrl } from '@/utils/socialLinks';

const ContactForm: React.FC = () => {
  return (
    <div className="fixed bottom-[58px] right-1 z-[99999] space-y-2 xl:bottom-5 xl:right-2">
      <div>
        <Link title="Liên hệ qua Messenger" target="_blank" href={messengerUrl} aria-label="Liên hệ qua Messenger">
          <FaFacebookMessenger className="text-[50px] text-[#1f6bf6]" />
        </Link>
      </div>
      <div>
        <Link title="Liên hệ qua Zalo" target="_blank" href={zaloUrl} aria-label="Liên hệ qua Zalo">
          <Image width={45} height={45} src={images.LogoZalo} alt="Zalo" className="h-full w-[45px] animate-zoomBorderBtn rounded-full xl:w-[50px]" />
        </Link>
      </div>
    </div>
  );
};

export default ContactForm;
