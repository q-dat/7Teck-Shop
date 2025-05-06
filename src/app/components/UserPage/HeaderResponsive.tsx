'use client';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { RxHamburgerMenu } from 'react-icons/rx';
import { FaHome, FaChevronDown } from 'react-icons/fa';
import { SlClose } from 'react-icons/sl';
import { IoSearch } from 'react-icons/io5';
import menuItems from '../utils/menuItems';
import Link from 'next/link';
import Image from 'next/image';
import { images } from '../../assets/images';

interface HeaderResponsiveProps {
  Title_NavbarMobile: ReactNode;
}

const HeaderResponsive: React.FC<HeaderResponsiveProps> = ({ Title_NavbarMobile }) => {
  const pathname = usePathname();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [rightVisible, setRightVisible] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [activeItem, setActiveItem] = useState('Trang Chủ');
  const [showMenu, setShowMenu] = useState(true);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    // Set active menu item
    const foundItem = menuItems.find((item) => item.link === pathname || item.submenu?.some((sub) => sub.link === pathname));
    if (foundItem) setActiveItem(foundItem.name);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowMenu(currentScrollY < lastScrollYRef.current || currentScrollY <= 50);
      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);
  const handleMenuClick = (name: string) => {
    setOpenSubmenu((prev) => (prev === name ? null : name));
  };

  const toggleRightVisible = () => setRightVisible((prev) => !prev);
  const handleSearchToggle = () => setOpenSearch((prev) => !prev);

  return (
    <div className="fixed z-[99999] block w-full bg-gradient-to-b from-white to-primary xl:hidden">
      <header
        className={`fixed top-0 h-[60px] w-full bg-gradient-to-r from-primary via-primary to-primary px-2 transition-all duration-300 ${showMenu ? '' : '-translate-y-full'}`}
      >
        <div className="relative flex h-full items-center justify-between">
          <Link href="/" aria-label="Trang chủ">
            <FaHome className="text-2xl text-white" />
          </Link>
          <p className="font-semibold text-white">{Title_NavbarMobile}</p>

          {/* Search */}
          <div className="absolute right-[40px] z-[999]">
            <div className="relative" onClick={handleSearchToggle}>
              <IoSearch className="animate-bounce text-xl text-white" />
              {openSearch && (
                <>
                  <div className="absolute -right-[40px] top-10 h-screen w-screen bg-black bg-opacity-50">
                    <input
                      type="text"
                      className="rounded-sm-none w-screen animate-fadeIn border-none px-4 py-2 text-[#000000] placeholder-primary focus:outline-none"
                      autoFocus
                      // placeholder="Bạn muốn tìm gì..."
                      placeholder="Tính năng tìm kiếm đang được phát triển!"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Drawer toggle button */}
          <button
            aria-expanded={rightVisible}
            aria-controls="drawer-menu"
            onClick={toggleRightVisible}
            className="flex items-center justify-center py-4 text-2xl xl:hidden"
          >
            <div className={`text-[25px] text-white transition-transform duration-300 ${rightVisible ? 'rotate-180 animate-ping' : ''}`}>
              {rightVisible ? <SlClose /> : <RxHamburgerMenu />}
            </div>
          </button>
        </div>
      </header>

      {/* Overlay khi menu mở */}
      {rightVisible && <div className="fixed inset-0 z-[99998] bg-black bg-opacity-50" onClick={toggleRightVisible} />}

      {/* Sidebar menu */}
      <div
        className={`fixed left-0 top-0 z-[99999] h-full w-2/3 transform bg-white transition-transform duration-300 ease-in-out ${
          rightVisible ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4">
          <Link href="/" onClick={() => setActiveItem('Trang Chủ')} aria-label="Trang chủ">
            <Image height={80} width={80} src={images.Logo} alt="LOGO" className="h-auto w-[80px]" />
          </Link>
        </div>
        <div className="flex flex-col space-y-2 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.name} className="relative">
                <Link
                  href={item.link}
                  onClick={() => {
                    if (!item.submenu) setRightVisible(false);
                    handleMenuClick(item.name);
                  }}
                  className={`flex items-center gap-2 rounded-sm px-2 py-4 text-sm transition-all ${
                    item.name === activeItem
                      ? 'bg-primary bg-opacity-30 font-bold text-primary'
                      : 'bg-primary bg-opacity-10 font-light text-[#000000]'
                  }`}
                >
                  {Icon && <Icon className="text-lg" />}
                  <span>{item.name}</span>
                  {item.submenu && (
                    <FaChevronDown className={`ml-auto transition-transform duration-300 ${openSubmenu === item.name ? 'rotate-180' : ''}`} />
                  )}
                </Link>

                {item.submenu && openSubmenu === item.name && (
                  <div className="relative w-full transform space-y-2 rounded-sm bg-white p-1 shadow-md transition-transform duration-300 ease-in-out">
                    {item.submenu.map((subItem, index) => (
                      <Link key={index} href={subItem.link} className="block">
                        <button className="flex w-full flex-row items-center justify-start gap-2 rounded-sm border-none bg-primary p-2 text-sm font-light text-white shadow-headerMenu">
                          {subItem.icon && <subItem.icon />}
                          {subItem.name}
                        </button>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HeaderResponsive;
