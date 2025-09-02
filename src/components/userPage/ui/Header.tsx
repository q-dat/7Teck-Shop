'use client';
import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Input, Kbd, Menu } from 'react-daisyui';
import { FaChevronDown } from 'react-icons/fa';
import { RiArrowLeftRightFill } from 'react-icons/ri';
import { IoCloseSharp, IoLogoFacebook, IoSearch } from 'react-icons/io5';
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
import { useRouter } from 'next/navigation';
import { debounce } from 'lodash';
import { searchProducts } from '@/services/searchService';
import { suggestions } from '@/utils/suggestions';
import { createPortal } from 'react-dom';
import { formatCurrency } from '@/utils/formatCurrency';

interface SearchResult {
  name: string;
  link: string;
  image: string;
  color?: string;
  price?: number;
  sale?: number;
  status?: string;
}

const EXCLUDED_STATUSES = [
  'hết hàng',
  'hết',
  'out of stock',
  'ngừng kinh doanh',
  'dừng kinh doanh',
  'ngừng bán',
  'không kinh doanh',
  'discontinued',
  'stop selling',
];

function normalizeStatus(status?: string): string {
  return status ? status.toLowerCase().trim().replace(/\s+/g, ' ') : '';
}

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
  // Search
  const [isInputFocused, setIsInputFocused] = useState(false);
  // Query state for search input
  const [query, setQuery] = useState('');
  // Reference to the input element for focusing
  const inputRef = useRef<HTMLInputElement>(null);
  // Search results
  const [results, setResults] = useState<SearchResult[]>([]);
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  // Router for navigation
  const router = useRouter();
  const handleSearchClose = () => {
    setQuery('');
    setResults([]);
    setIsInputFocused(false);
  };

  // Other states
  const pathname = usePathname();
  // Translation
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  // Naviga Active
  const [activeItem, setActiveItem] = useState('Trang Chủ');
  // SubMenu
  const handleMouseEnter = (name: string) => {
    setOpenSubmenu(name);
  };

  const handleMouseLeave = () => {
    setOpenSubmenu(null);
  };
  useEffect(() => {
    // Handle scroll and active menu item
    const foundItem = menuItems.find((item) => item.link === pathname || item.submenu?.some((sub) => sub.link === pathname));
    if (foundItem) {
      setActiveItem(foundItem.name);
    }
    // Focus the input when the F key is pressed
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'f' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }

      if (e.key === 'Escape') {
        inputRef.current?.blur(); // bỏ focus
        setIsInputFocused(false); // cập nhật trạng thái focus
        setQuery(''); // xóa nội dung tìm kiếm
        setResults([]); // xóa kết quả tìm kiếm
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [pathname]);
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
        <div className="relative flex w-full flex-col items-center justify-center gap-1">
          <div className="relative z-10 flex w-full flex-row items-center justify-center gap-1 rounded-full bg-white pl-2">
            <IoSearch className="text-xl text-primary" />
            <Input
              ref={inputRef}
              size="sm"
              value={query}
              onChange={handleChange}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
              className="w-full border-none bg-transparent pl-1 text-sm text-black placeholder-primary shadow-none focus:placeholder-black focus:outline-none"
              placeholder="Bạn muốn tìm gì..."
            />
            {/* Kbd */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <Kbd size="sm" className="rounded border border-primary bg-white text-xs font-bold text-primary shadow-inner xl:text-sm">
                {!isInputFocused ? <>F</> : <>Esc</>}
              </Kbd>
            </div>
          </div>

          {/* Suggestion keywords */}
          {isInputFocused && !query && (
            <div className="fixed left-[50%] top-[100px] z-[99999] w-full max-w-[600px] -translate-x-1/2 rounded-none bg-white p-2 shadow-md">
              <p className="mb-2 text-sm font-semibold text-primary">Từ khóa phổ biến</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((text, index) => (
                  <button
                    key={index}
                    onClick={() => {
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

          {/* Result */}
          {query && results.length > 0 && (
            <ul className="fixed left-[50%] top-[100px] z-[99999] max-h-[500px] w-full max-w-[600px] -translate-x-1/2 overflow-auto rounded-none border bg-white p-2 text-primary shadow-md">
              <span className="text-sm font-medium">Sản phẩm gợi ý</span>
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
                  }}
                >
                  <Image src={item.image} alt={item.name} width={40} height={40} className="h-12 w-12 shrink-0 rounded object-cover" />

                  <div className="flex w-full flex-col">
                    <p className="">
                      <span className="text-sm font-semibold text-black group-hover:text-white">{item.name}</span>
                      {item?.status ? (
                        normalizeStatus(item.status) === 'new' ? (
                          <span></span>
                        ) : EXCLUDED_STATUSES.includes(normalizeStatus(item.status)) ? (
                          <span className="mx-1 rounded-sm border border-primary bg-primary-content p-[2px] text-xs font-medium text-primary line-through group-hover:border-white group-hover:text-black">
                            Hết hàng
                          </span>
                        ) : (
                          <span className="mx-1 rounded-sm border border-primary bg-orange-300 p-[2px] text-xs font-medium text-default group-hover:border-white">
                            Máy cũ - giá tốt
                          </span>
                        )
                      ) : null}
                    </p>
                    {/* {item.color && <span className="font-semibold text-black group-hover:text-white">Màu: {item.color}</span>} */}
                    {item.price !== undefined && (
                      <p className="">
                        <span className="text-sm font-semibold text-price group-hover:text-white">{formatCurrency(item?.price)}</span>
                        {item?.sale && (
                          <del className="ml-2 text-xs font-light text-gray-400 group-hover:text-white">{formatCurrency(item?.sale)}</del>
                        )}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* 404 */}
          {query && !isLoading && results.length === 0 && (
            <p className="fixed left-[50%] top-[100px] z-[99999] w-full max-w-[600px] -translate-x-1/2 rounded-none bg-white p-2 text-sm text-gray-500 shadow-md">
              Không tìm thấy kết quả
            </p>
          )}
          {typeof window !== 'undefined' &&
            (isInputFocused || (query && (results.length > 0 || (!isLoading && results.length === 0)))) &&
            createPortal(
              <>
                <div
                  className="fixed inset-0 z-[99998] cursor-pointer bg-[#000000]/60"
                  onClick={() => {
                    setIsInputFocused(false);
                    setQuery('');
                    setResults([]);
                  }}
                />
                <div className="fixed bottom-24 left-1/2 z-[99999] -translate-x-1/2">
                  <button className="rounded-full border border-white bg-black/60 p-1 shadow-xl" onClick={handleSearchClose}>
                    <IoCloseSharp className="text-4xl text-white" />
                  </button>
                </div>
              </>,
              document.body
            )}
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
            <Image width={60} height={60} className="h-full w-full rounded-full object-contain filter" loading="lazy" src={images.Logo} alt="LOGO" />
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
