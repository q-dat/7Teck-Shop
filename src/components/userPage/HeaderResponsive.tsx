'use client';
import React, { ReactNode, useEffect, useState, useMemo } from 'react';
import { Button, Drawer, Input, Menu } from 'react-daisyui';
import { RxHamburgerMenu } from 'react-icons/rx';
import { FaChevronDown } from 'react-icons/fa';
import { SlClose } from 'react-icons/sl';
import { IoCloseSharp, IoSearch } from 'react-icons/io5';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { images } from '../../../public/images';
import Image from 'next/image';
import menuItems from '@/utils/menuItems';
import { debounce } from 'lodash';
import { searchProducts } from '@/services/searchService';
import { suggestions } from '@/utils/suggestions';
import { formatCurrency } from '@/utils/formatCurrency';

interface SearchResult {
  name: string;
  link: string;
  image: string;
  color?: string;
  price?: number;
}

interface HeaderResponsiveProps {
  Title_NavbarMobile: ReactNode;
}

export default function HeaderResponsive({ Title_NavbarMobile }: HeaderResponsiveProps) {
  // Search
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Other states
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [rightVisible, setRightVisible] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [activeItem, setActiveItem] = useState('Trang Chủ');
  const [showMenu, setShowMenu] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const pathname = usePathname();

  // Handle scroll and active menu item
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
  }, [lastScrollY, pathname]);

  // Debounced search function
  const handleSearch = useMemo(
    () =>
      debounce(async (text: string) => {
        if (!text.trim()) {
          setResults([]);
          setIsLoading(false);
          return;
        }

        try {
          setIsLoading(true);
          const data = await searchProducts(text);
          setResults(data);
        } catch (error) {
          console.error('Lỗi khi tìm kiếm:', error);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      }, 300),
    []
  );

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    handleSearch(value);
  };

  const handleMenuClick = (name: string) => {
    setOpenSubmenu((prev) => (prev === name ? null : name));
  };

  const toggleRightVisible = () => setRightVisible((prev) => !prev);

  const handleSearchToggle = () => {
    setOpenSearch(!openSearch);
  };

  return (
    <div className="fixed z-[99999] block w-full bg-gradient-to-b from-white to-primary xl:hidden">
      <header
        className={`fixed h-[60px] w-full bg-gradient-to-r from-primary via-primary to-primary px-2 transition-all delay-200 duration-300 ease-in-out ${
          showMenu ? 'top-0' : 'top-0'
        }`}
      >
        <div className="flex flex-row items-center justify-between">
          <Link aria-label="Trang chủ" href="/">
            <Image src={images.Logo} alt={images.Logo} width={30} height={30} className="h-[30px] w-[30px] rounded-full" />
          </Link>
          <p className="font-semibold text-white">{Title_NavbarMobile}</p>
          {/* Search Toggle */}
          <div className="absolute right-[50px]">
            <div className="relative">
              <IoSearch className="animate-bounce text-xl text-white" onClick={() => setOpenSearch(true)} />
              {openSearch && (
                <div>
                  <div className="absolute -right-[50px] top-10 h-screen w-screen bg-black bg-opacity-50" onClick={handleSearchToggle}>
                    {/* Overlay */}
                  </div>
                  <Input
                    type="text"
                    value={query}
                    onChange={handleChange}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
                    className="z- absolute -right-[50px] top-10 w-screen animate-exfadeIn rounded-none border-none text-black placeholder-primary focus:outline-none"
                    autoFocus
                    placeholder="Bạn muốn tìm gì..."
                  />

                  {/* Suggestion keywords */}
                  {isInputFocused && !query && (
                    <div className="fixed left-[50%] top-[100px] z-[99999] w-full max-w-[600px] -translate-x-1/2 rounded-md bg-white p-2 shadow-md">
                      <p className="mb-2 text-sm font-semibold text-primary">Từ khóa phổ biến</p>
                      <div className="flex flex-wrap gap-2">
                        {suggestions.map((text, index) => (
                          <button
                            key={index}
                            onMouseDown={() => {
                              setQuery(text);
                              handleSearch(text);
                            }}
                            className="rounded-full border border-gray-200 bg-[#f3f3f3] px-3 py-1 text-xs text-gray-600 hover:border-primary hover:bg-primary hover:text-white"
                          >
                            {text}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Result */}
            {openSearch && query && results.length > 0 && (
              <ul className="fixed left-[50%] top-[100px] z-[99999] max-h-[500px] w-full max-w-[600px] -translate-x-1/2 overflow-auto rounded-md border bg-white p-2 text-primary shadow-md">
                {results.map((item, index) => (
                  <li
                    key={index}
                    className={`group flex cursor-pointer items-start gap-3 p-2 text-sm hover:bg-primary ${
                      index !== results.length - 1 ? 'border-b border-gray-50' : ''
                    }`}
                    onClick={() => {
                      router.push(item.link);
                      setQuery('');
                      setResults([]);
                      setOpenSearch(false);
                    }}
                    aria-label={`Chọn ${item.name}`}
                  >
                    <Image src={item.image} alt={item.name} width={40} height={40} className="h-12 w-12 shrink-0 rounded object-cover" />

                    <div className="flex w-full flex-col">
                      <span className="font-semibold text-primary group-hover:text-white">{item.name}</span>
                      {item.color && <span className="font-semibold text-black group-hover:text-white">Màu: {item.color}</span>}
                      {item.price !== undefined && (
                        <span className="text-sm font-semibold text-red-700 group-hover:text-white">{formatCurrency(item.price)}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {/* 404 */}
            {query && !isLoading && results.length === 0 && (
              <p className="fixed left-[50%] top-[100px] z-[99999] w-full max-w-[600px] -translate-x-1/2 rounded-md bg-white p-2 text-sm text-gray-500 shadow-md">
                Không tìm thấy kết quả
              </p>
            )}
            {/* Close Search */}
            {openSearch && (
              <div className="fixed bottom-24 left-1/2 z-[99999] -translate-x-1/2">
                <button className="rounded-full border border-white bg-black/60 shadow-xl" onClick={handleSearchToggle}>
                  <IoCloseSharp className="text-4xl text-white" />
                </button>
              </div>
            )}
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
