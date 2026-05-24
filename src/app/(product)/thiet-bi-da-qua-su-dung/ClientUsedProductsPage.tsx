'use client';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { MdOutlineDoubleArrow } from 'react-icons/md';

import HeaderResponsive from '@/components/userPage/ui/HeaderResponsive';
import ClientUsedPhonePage from './ClientUsedPhonePage';
import ClientUsedTabletPage from './ClientUsedTabletPage';
import ClientUsedMacbookPage from './ClientUsedMacbookPage';
import ClientUsedWindowsPage from './ClientUsedWindowsPage';
import ClientUsedLaptopPage from './ClientUsedLaptopPage';

import { IPhone } from '@/types/type/products/phone/phone';
import { ITablet } from '@/types/type/products/tablet/tablet';
import { IMacbook } from '@/types/type/products/macbook/macbook';
import { IWindows } from '@/types/type/products/windows/windows';

interface CategoryItem {
  id: string;
  label: string;
}

interface CategoryMenuProps {
  categories: CategoryItem[];
  isOpen: boolean;
  selectedCategory: string;
  toggleMenu: () => void;
  scrollToSection: (id: string) => void;
}

const CategoryMenuComponent = ({ categories, isOpen, toggleMenu, selectedCategory, scrollToSection }: CategoryMenuProps) => {
  return (
    <div
      onClick={toggleMenu}
      className={`fixed left-0 top-1/3 z-[999] mx-1 w-auto overflow-hidden rounded-r-[50%] border-2 border-b-0 border-l-0 border-t-0 border-primary bg-gradient-to-r from-transparent to-white py-[25px] text-primary transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'ml-4 -translate-x-full'
        }`}
    >
      <div className="flex h-full cursor-pointer flex-row items-center justify-center gap-1">
        <nav className="flex w-full flex-col items-start justify-center gap-2">
          {categories.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              className={`w-full rounded-sm border border-primary bg-primary px-1 py-2 text-start text-sm hover:scale-105 hover:outline hover:outline-offset-1 hover:outline-primary ${selectedCategory === id ? 'bg-white text-primary' : 'text-white'
                }`}
              onClick={(event) => {
                event.stopPropagation();
                scrollToSection(id);
              }}
            >
              {label}
            </button>
          ))}
        </nav>

        <MdOutlineDoubleArrow className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
      </div>
    </div>
  );
};

CategoryMenuComponent.displayName = 'CategoryMenuComponent';

const CategoryMenu = memo(CategoryMenuComponent);

interface CategorySectionProps {
  isOpen: boolean;
  shouldMergeLaptop: boolean;
  phones: IPhone[];
  tablets: ITablet[];
  macbooks: IMacbook[];
  windows: IWindows[];
}

const CategorySectionComponent = ({ isOpen, shouldMergeLaptop, phones, tablets, macbooks, windows }: CategorySectionProps) => {
  return (
    <div className={`px-2 transition-all duration-300 xl:px-desktop-padding ${isOpen ? 'ml-20 xl:ml-5' : 'ml-0'}`}>
      {
        phones.length > 0 &&
        <div id="used-phone">
          <ClientUsedPhonePage phones={phones} />
        </div>
      }
      {
        tablets.length > 0 &&
        <div id="used-tablet">
          <ClientUsedTabletPage tablets={tablets} />
        </div>
      }

      {shouldMergeLaptop ? (
        <div id="used-laptop">
          <ClientUsedLaptopPage macbooks={macbooks} windows={windows} />
        </div>
      ) : (
        <>
          <div id="used-macbook">
            <ClientUsedMacbookPage macbooks={macbooks} />
          </div>

          <div id="used-windows">
            <ClientUsedWindowsPage windows={windows} />
          </div>
        </>
      )}
    </div>
  );
};

CategorySectionComponent.displayName = 'CategorySectionComponent';

const CategorySection = memo(CategorySectionComponent);

interface ClientUsedProductsPageProps {
  phones: IPhone[];
  tablets: ITablet[];
  macbooks: IMacbook[];
  windows: IWindows[];
}

export default function ClientUsedProductsPage({ phones, tablets, macbooks, windows }: ClientUsedProductsPageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('used-phone');

  const shouldMergeLaptop = macbooks.length < 10 || windows.length < 10;

  const categories = useMemo<CategoryItem[]>(() => {
    if (shouldMergeLaptop) {
      return [
        { id: 'used-phone', label: 'iPhone' },
        { id: 'used-tablet', label: 'iPad' },
        { id: 'used-laptop', label: 'Laptop' },
      ];
    }

    return [
      { id: 'used-phone', label: 'iPhone' },
      { id: 'used-tablet', label: 'iPad' },
      { id: 'used-macbook', label: 'Macbook' },
      { id: 'used-windows', label: 'Windows' },
    ];
  }, [shouldMergeLaptop]);

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const scrollToSection = useCallback((id: string) => {
    setSelectedCategory(id);

    window.setTimeout(() => {
      const element = document.getElementById(id);

      if (!element) return;

      window.scrollTo({
        top: element.offsetTop,
        behavior: 'smooth',
      });
    }, 100);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setSelectedCategory(entry.target.id);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.5,
      }
    );

    categories.forEach(({ id }) => {
      const section = document.getElementById(id);

      if (section) {
        observer.observe(section);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [categories]);

  return (
    <div className="w-full">
      <HeaderResponsive Title_NavbarMobile="7teck.vn" />

      <div className="py-[60px] xl:pt-0">
        <div className="breadcrumbs px-[10px] text-sm text-black shadow xl:px-desktop-padding">
          <ul className="font-light">
            <li>
              <Link aria-label="Trang chủ" href="/">
                Trang Chủ
              </Link>
            </li>

            <li>
              <Link aria-label="Thiết bị qua sử dụng" href="/used">
                Thiết bị đã qua sử dụng
              </Link>
            </li>
          </ul>
        </div>
        {/*  */}
        <div className="w-full rounded-md bg-gradient-to-r from-primary/10 via-transparent to-secondary/5 p-3">
          <div className="mx-auto max-w-6xl text-center">
            <p className="mx-auto max-w-2xl text-sm leading-6 text-gray-700">
              <span className="block text-xs text-gray-500">Danh mục thiết bị đã qua sử dụng - Lựa chọn đáng tin cậy</span>
              <span className="text-base font-semibold text-primary xl:text-lg">Chất lượng đảm bảo - Giá cả hợp lý - Hỗ trợ trả góp & bảo hành.</span>
            </p>
          </div>
        </div>

        <div className="relative">
          <CategoryMenu
            categories={categories}
            isOpen={isOpen}
            toggleMenu={toggleMenu}
            selectedCategory={selectedCategory}
            scrollToSection={scrollToSection}
          />

          <CategorySection
            isOpen={isOpen}
            shouldMergeLaptop={shouldMergeLaptop}
            phones={phones}
            tablets={tablets}
            macbooks={macbooks}
            windows={windows}
          />
        </div>
      </div>
    </div>
  );
}