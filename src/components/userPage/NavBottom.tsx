'use client';

import Link from 'next/link';
import React from 'react';
import { usePathname } from 'next/navigation';
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

const HIDDEN_NAV_ROUTES = ['/ghi-chu', '/sub-note'] as const;

const NavBottom: React.FC = () => {
  const pathname = usePathname();

  const shouldHideNavBottom = HIDDEN_NAV_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (shouldHideNavBottom) return null;

  return (
    <div className="fixed bottom-0 left-0 z-header-mobile w-full bg-white xl:hidden">
      <div className="flex h-[50px] w-full justify-between divide-x-[1px] divide-white">
        {navLink.map((item) => {
          const Icon = item.icon;

          return (
            <Link key={item.link} href={item.link} className="flex-grow">
              <button
                type="button"
                className="flex h-full w-full flex-col items-center justify-center gap-[2px] bg-default text-white"
              >
                <Icon className="text-lg text-white" />
                <span className="text-[10px]">{item.name}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default NavBottom;