'use client';
import Link from 'next/link';
import React from 'react';
import { FaMobileAlt, FaTabletAlt, FaWindows } from 'react-icons/fa';
import { MdListAlt } from 'react-icons/md';
import { RiMacbookFill } from 'react-icons/ri';
const navLink = [
  {
    icon: FaMobileAlt,
    name: 'Điện Thoại',
    link: '/dien-thoai',
  },
  {
    icon: FaTabletAlt,
    name: 'Máy tính bảng',
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
    name: 'Thiết bị cũ',
    link: '/thiet-bi-da-qua-su-dung',
  },
];
const NavBottom: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-0 z-[9999999] w-full bg-white xl:hidden">
      <div className="flex h-[50px] w-full justify-between divide-x-[1px] divide-white">
        {navLink.map((item, index) => {
          const Icon = item.icon;
          return (
            <Link key={index} href={item.link} className="flex-grow">
              <button className="flex h-full w-full flex-col items-center justify-center gap-[2px] bg-default text-white">
                {Icon && <Icon className="text-lg text-white" />}
                <span className="text-[10px]"> {item.name}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default NavBottom;
