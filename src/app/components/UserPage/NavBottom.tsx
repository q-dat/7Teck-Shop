'use client';
import Link from 'next/link';
import React from 'react';
import { FaMobileAlt, FaTabletAlt, FaWindows } from 'react-icons/fa';
import { MdListAlt } from 'react-icons/md';
import { RiMacbookFill } from 'react-icons/ri';
const navLink = [
  {
    icon: FaMobileAlt,
    name: 'iPhone',
    link: '/dien-thoai',
  },
  {
    icon: FaTabletAlt,
    name: 'ipad',
    link: '/may-tinh-bang',
  },
  {
    icon: RiMacbookFill,
    name: 'Macbook',
    link: '/macbook',
  },
  {
    icon: FaWindows,
    name: 'Windows',
    link: '/windows',
  },
  {
    icon: MdListAlt,
    name: 'Giá thu cũ',
    link: '/bang-gia-thu-mua',
  },
];
const NavBottom: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-0 z-[99999] w-full xl:hidden">
      <div className="flex h-[50px] w-full justify-between gap-[1px] bg-white text-xs">
        {navLink.map((item, index) => {
          const Icon = item.icon;
          return (
            <Link key={index} href={item.link} className="flex-grow">
              <button className="flex h-full w-full flex-col items-center justify-center bg-black p-1 text-white">
                {Icon && <Icon className="text-lg" />}
                {item.name}
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default NavBottom;
