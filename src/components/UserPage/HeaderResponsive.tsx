'use client';
import React, { ReactNode, useEffect, useState } from 'react';
import { Button, Drawer, Input, Menu } from 'react-daisyui';
import { RxHamburgerMenu } from 'react-icons/rx';
import { FaHome, FaChevronDown } from 'react-icons/fa';
import { SlClose } from 'react-icons/sl';
import { IoSearch } from 'react-icons/io5';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { images } from '../../../public/images';
import Image from 'next/image';
import menuItems from '@/utils/menuItems';

interface HeaderResponsiveProps {
  Title_NavbarMobile: ReactNode;
}
export default function HeaderResponsive({ Title_NavbarMobile }: HeaderResponsiveProps) {

  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [rightVisible, setRightVisible] = useState(false);
  // SearchToggle Input
  const [openSearch, setOpenSearch] = useState(false);
  // Naviga Active
  const [activeItem, setActiveItem] = useState('Trang Chủ');
  //
  const [showMenu, setShowMenu] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  //
  const pathname = usePathname();
  //
  useEffect(() => {
    const foundItem = menuItems.find((item) => item.link === pathname || item.submenu?.some((sub) => sub.link === pathname));
    if (foundItem) {
      setActiveItem(foundItem.name);
    }
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setShowMenu(false);
      } else {
        setShowMenu(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY,pathname]);

  const handleMenuClick = (name: string) => {
    setOpenSubmenu((prev) => (prev === name ? null : name));
  };

  const toggleRightVisible = () => setRightVisible((prev) => !prev);
  // Search Input
  const handleSearchToggle = () => {
    setOpenSearch(!openSearch);
  };

  return (
    <div className="fixed z-[99999] block w-full bg-gradient-to-b from-white to-primary xl:hidden">
      <header
        className={`fixed h-[60px] w-full bg-gradient-to-r from-primary via-primary to-primary px-2 transition-all delay-200 duration-300 ease-in-out ${showMenu ? 'top-0' : 'top-0'}`}
      >
        <div className="flex flex-row items-center justify-between">
          <Link aria-label="Trang chủ" href="/">
            <FaHome className="text-2xl text-white" />
          </Link>
          <p className="font-semibold text-white">{Title_NavbarMobile}</p>
          {/* Search Toggle*/}
          <div className="absolute right-[50px]">
            <div className="relative" onClick={handleSearchToggle}>
              <IoSearch className="animate-bounce text-xl text-white" />
              <div>
                {openSearch && (
                  <div className="absolute -right-[50px] top-10 h-screen w-screen bg-black bg-opacity-50">
                    <Input
                      type="text"
                      className="w-screen animate-exfadeIn rounded-none border-none text-black placeholder-primary focus:outline-none"
                      autoFocus
                      placeholder="Bạn muốn tìm gì..."
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* RightVisible */}
          <div className="z-50">
            <Drawer
              open={rightVisible}
              onClickOverlay={toggleRightVisible}
              aria-hidden={!rightVisible}
              tabIndex={rightVisible ? 0 : -1}
              side={
                <Menu role="menu" className="fixed h-full w-2/3 bg-white">
                  {/* LOGO */}
                  <Link aria-label="Trang chủ" href="/" onClick={() => setActiveItem('Trang Chủ')}>
                    <Image className="h-full w-[80px]" loading="lazy" height={100} width={80} src={images.Logo} alt="LOGO" />
                  </Link>
                  {/* Menu */}
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.name} className="relative" onClick={() => item.submenu && handleMenuClick(item.name)}>
                        <Menu.Item role="menuitem" className="group relative">
                          <Link
                            href={item.link}
                            className={`btn relative mt-2 flex w-full flex-row items-center justify-start rounded-none border-none ${
                              item.name === activeItem
                                ? 'bg-primary bg-opacity-30 text-sm font-bold text-primary'
                                : 'border-none bg-primary bg-opacity-10 text-sm font-light text-black shadow-headerMenu'
                            } `}
                          >
                            <>
                              {item.name === activeItem && <div className="absolute bottom-0 left-0 h-[2px] w-full bg-primary" />}
                              {Icon && (
                                <div className={item.name === activeItem ? 'text-xl text-primary' : ''}>
                                  <Icon />
                                </div>
                              )}
                              <span className={Icon ? '' : ''}>{item.name}</span>
                              {item.submenu && (
                                <div className={` ${openSubmenu === item.name ? 'rotate-180' : ''}`}>
                                  <FaChevronDown />
                                </div>
                              )}
                            </>
                          </Link>
                        </Menu.Item>
                        {/* SubMenu */}
                        {item.submenu && openSubmenu === item.name && (
                          <div className="relative w-full transform space-y-2 rounded-sm bg-white p-1 shadow-md transition-transform duration-300 ease-in-out">
                            {item.submenu.map((subItem, index) => (
                              <Link key={index} href={subItem.link} className="block">
                                <Button
                                  size="sm"
                                  className="flex w-full flex-row items-center justify-start rounded-sm border-none bg-primary text-sm font-light text-white shadow-headerMenu hover:bg-primary/80"
                                >
                                  {subItem.icon && <subItem.icon />}
                                  {subItem.name}
                                </Button>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </Menu>
              }
            >
              {/*  */}
              <button
                aria-expanded={rightVisible}
                aria-controls="drawer-menu"
                onClick={toggleRightVisible}
                className="flex flex-row items-center justify-center gap-2 py-4 text-2xl xl:hidden"
              >
                <div
                  className={`transform rounded-md text-[25px] text-white transition-transform duration-300 ease-in-out ${
                    rightVisible ? 'rotate-180 animate-ping' : 'rotate-0'
                  }`}
                >
                  <p>{rightVisible ? <SlClose /> : <RxHamburgerMenu />}</p>
                </div>
              </button>
            </Drawer>
          </div>
        </div>
      </header>
    </div>
  );
}
