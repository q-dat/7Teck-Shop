'use client';
import React, { memo, useEffect, useState } from 'react';
import { Button, Input, Menu } from 'react-daisyui';
import { FaChevronDown } from 'react-icons/fa';
import { RiArrowLeftRightFill } from 'react-icons/ri';
import { IoLogoFacebook, IoSearch } from 'react-icons/io5';
import { RiExternalLinkFill } from 'react-icons/ri';
import { HiLocationMarker } from 'react-icons/hi';
import { HiPhoneArrowUpRight } from 'react-icons/hi2';
import { TbPigMoney } from 'react-icons/tb';
import { GiRibbonMedal } from 'react-icons/gi';
import menuItems from '@/utils/menuItems';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { images } from '../../../../public/images';
import Image from 'next/image';
import { hotlineUrl } from '@/utils/socialLinks';

const items = [
  {
    icon: <RiArrowLeftRightFill />,
    text: (
      <>
        <p className="font-bold">Thu cũ</p> đổi mới <p className="font-bold">lên tới 90%</p>
      </>
    ),
  },
  {
    icon: <GiRibbonMedal />,
    text: (
      <>
        Sản phẩm <p className="font-bold">Chính hãng</p>
      </>
    ),
  },
  {
    icon: <TbPigMoney />,
    text: (
      <>
        Hỗ trợ <p className="font-bold">Trả góp</p>
      </>
    ),
  },
];
const Header: React.FC = () => {
  const pathname = usePathname();
  // Translation
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  // SubMenu
  const handleMouseEnter = (name: string) => {
    setOpenSubmenu(name);
  };

  const handleMouseLeave = () => {
    setOpenSubmenu(null);
  };
  // Naviga Active
  const [activeItem, setActiveItem] = useState('Trang Chủ');
  //
  useEffect(() => {
    const foundItem = menuItems.find((item) => item.link === pathname || item.submenu?.some((sub) => sub.link === pathname));
    if (foundItem) {
      setActiveItem(foundItem.name);
    }
  }, [pathname]);

  return (
    <div className="fixed left-0 top-0 z-[99999] hidden w-full flex-col xl:block">
      {/* Benefits */}
      <div className="h-[30px] bg-[#FFC107] text-black xl:px-desktop-padding">
        <div className="flex h-full w-full flex-row items-center justify-around">
          {items.map((item, index) => (
            <div key={index} className="flex items-center justify-center gap-1 font-light">
              {React.cloneElement(item.icon, {
                className: 'text-xl text-black',
              })}
              <>{item.text}</>
            </div>
          ))}
        </div>
      </div>
      {/* */}
      <div
        className={`flex h-[40px] w-full transform flex-row items-center justify-between border-b bg-primary text-xs text-white transition-transform delay-100 duration-300 ease-in-out hover:text-white xl:px-desktop-padding`}
      >
        <div className="w-full">
          <div className="flex items-center">
            <Link href="https://maps.app.goo.gl/pmk3d7i2tmjc3pP8A" target="_blank" className="flex items-center gap-[1px]">
              <HiLocationMarker />
              <p>136/11 Trần Quang Diệu, P.14, Q.3, TP.HCM</p>
              <sup>
                <RiExternalLinkFill className="text-xs" />
              </sup>
            </Link>
          </div>
        </div>
        {/* Input Search */}
        <div className="relative flex w-full flex-row items-center justify-center gap-1 rounded-full bg-white pl-2">
          <IoSearch className="text-xl text-primary" />
          <Input
            size="sm"
            className="w-full border-none bg-transparent pl-1 text-sm text-black placeholder-primary shadow-none focus:placeholder-black focus:outline-none"
            placeholder="Bạn muốn tìm gì..."
          />
        </div>
        <div className="flex w-full flex-row items-center justify-end gap-5">
          {/*  */}
          <div className="flex items-center">
            <Link href="https://www.facebook.com/7teck.vn" target="_blank" className="flex items-center gap-[1px]">
              <IoLogoFacebook className="text-xs" />
              Fanpage: &nbsp;
              <p>7Teck</p>
              <sup>
                <RiExternalLinkFill className="text-xs" />
              </sup>
            </Link>
          </div>
          <div className="flex items-center">
            <Link href={hotlineUrl} className="flex items-center gap-[1px] font-light">
              <HiPhoneArrowUpRight className="text-xs" /> (+84) 333.133.050
            </Link>
          </div>
        </div>
      </div>
      {/* Menu */}
      <header
        className={`h-[60px] w-full transform flex-row items-center justify-between bg-white py-2 shadow-md transition-transform delay-100 duration-300 ease-in-out xl:flex xl:px-desktop-padding`}
      >
        <nav className="h-full">
          <Link aria-label="Home" href="/" onClick={() => setActiveItem('Trang Chủ')}>
            <Image width={60} height={60} className="filter h-full w-full rounded-full object-contain" loading="lazy" src={images.Logo} alt="LOGO" />
          </Link>
        </nav>
        <Menu className="flex flex-row items-center justify-center gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Menu.Item
                key={item.name}
                className="group relative"
                onMouseEnter={() => item.submenu && handleMouseEnter(item.name)}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href={item.link}
                  className={`btn relative flex w-full items-center justify-center gap-1 rounded-none border-none ${
                    item.name === activeItem
                      ? 'bg-primary bg-opacity-20 text-sm font-bold text-primary'
                      : 'border-none bg-transparent text-sm font-light text-primary shadow-none hover:scale-110 hover:border hover:border-primary hover:bg-gray-50 hover:bg-opacity-30'
                  }`}
                >
                  <>
                    {item.name === activeItem && <div className="absolute bottom-0 left-0 h-[2px] w-full bg-primary" />}
                    {Icon && <Icon className={item.name === activeItem ? 'h-5 w-5 text-primary' : 'h-5 w-5'} />}
                    <span className={Icon ? '' : ''}>{item.name}</span>
                    {item.submenu && <FaChevronDown className={`m-0 h-4 w-4 p-0 ${openSubmenu === item.name ? 'rotate-180' : ''}`} />}
                  </>
                </Link>
                {/* SubMenu */}
                {item.submenu && (
                  <Menu className="absolute top-full m-0 hidden w-[260px] transform flex-col gap-2 rounded-sm bg-white bg-opacity-90 p-1 shadow-mainMenu transition-transform duration-300 ease-in-out group-hover:flex">
                    {item.submenu.map((subItem, index) => (
                      <Link key={index} href={subItem.link} className="flex flex-row gap-0">
                        <Button
                          size="sm"
                          className="flex w-full flex-row items-center justify-start rounded-sm border-none bg-primary text-sm font-light text-white shadow-headerMenu hover:h-[50px] hover:bg-primary hover:bg-opacity-50"
                        >
                          {subItem.icon && <subItem.icon />}
                          {subItem.name}
                        </Button>
                      </Link>
                    ))}
                  </Menu>
                )}
              </Menu.Item>
            );
          })}
        </Menu>
        <div className="flex items-center justify-center gap-5">
          {/* DarkMode Button */}
          {/* <DarkMode /> */}
        </div>
      </header>
    </div>
  );
};

export default memo(Header);
