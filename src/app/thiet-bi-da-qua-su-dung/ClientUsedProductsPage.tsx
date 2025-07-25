'use client';
import { useState, memo, useCallback, useEffect } from 'react';
import { MdOutlineDoubleArrow } from 'react-icons/md';
import ClientUsedPhonePage from './ClientUsedPhonePage';
import ClientUsedTabletPage from './ClientUsedTabletPage';
import ClientUsedMacbookPage from './ClientUsedMacbookPage';
import ClientUsedWindowsPage from './ClientUsedWindowsPage';
import HeaderResponsive from '@/components/userPage/HeaderResponsive';
import Link from 'next/link';
import { IPhoneCatalog } from '@/types/type/catalogs/phone-catalog/phone-catalog';
import { ITabletCatalog } from '@/types/type/catalogs/tablet-catalog/tablet-catalog';
import { IMacbookCatalog } from '@/types/type/catalogs/macbook-catalog/macbook-catalog';
import { IWindowsCatalog } from '@/types/type/catalogs/windows-catalog/windows-catalog';

// Danh sách danh mục sản phẩm
const categories = [
  { id: 'used-phone', label: 'iPhone' },
  { id: 'used-tablet', label: 'iPad' },
  { id: 'used-macbook', label: 'Macbook' },
  { id: 'used-windows', label: 'Windows' },
];
interface CategoryMenuProps {
  isOpen: boolean;
  toggleMenu: () => void;
  selectedCategory: string;
  scrollToSection: (id: string) => void;
}

// Component điều hướng menu
const CategoryMenuComponent = memo(({ isOpen, toggleMenu, selectedCategory, scrollToSection }: CategoryMenuProps) => (
  <div
    onClick={toggleMenu}
    className={`fixed left-0 top-1/3 z-[999] mx-1 w-auto overflow-hidden rounded-r-[50%] border-2 border-b-0 border-l-0 border-t-0 border-primary bg-gradient-to-r from-transparent to-white py-[25px] text-primary transition-transform duration-300 ${
      isOpen ? 'translate-x-0' : 'ml-4 -translate-x-full'
    }`}
  >
    <div className="flex h-full cursor-pointer flex-row items-center justify-center gap-1">
      <nav className="flex w-full flex-col items-start justify-center gap-2">
        {categories.map(({ id, label }) => (
          <button
            key={id}
            className={`w-full rounded-sm border border-primary bg-primary px-1 py-2 text-start text-sm hover:scale-105 hover:outline hover:outline-offset-1 hover:outline-primary ${
              selectedCategory === id ? 'bg-white text-primary' : 'text-white'
            }`}
            onClick={() => scrollToSection(id)}
          >
            {label}
          </button>
        ))}
      </nav>
      <div>
        <MdOutlineDoubleArrow className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
      </div>
    </div>
  </div>
));
CategoryMenuComponent.displayName = 'CategoryMenuComponent';
const CategoryMenu = memo(CategoryMenuComponent);

// Component hiển thị danh mục sản phẩm
const CategorySectionComponent = memo(
  ({
    isOpen,
    phoneCatalogs,
    tabletCatalogs,
    macbookCatalogs,
    windowsCatalogs,
  }: {
    isOpen: boolean;
    phoneCatalogs: IPhoneCatalog[];
    tabletCatalogs: ITabletCatalog[];
    macbookCatalogs: IMacbookCatalog[];
    windowsCatalogs: IWindowsCatalog[];
  }) => (
    <div className={`px-2 transition-all duration-300 xl:px-desktop-padding ${isOpen ? 'ml-20 xl:ml-5' : 'ml-0'}`}>
      <div id="used-phone">
        <ClientUsedPhonePage phoneCatalogs={phoneCatalogs} />
      </div>
      <div id="used-tablet">
        <ClientUsedTabletPage tabletCatalogs={tabletCatalogs} />
      </div>
      <div id="used-macbook">
        <ClientUsedMacbookPage macbookCatalogs={macbookCatalogs} />
      </div>
      <div id="used-windows">
        <ClientUsedWindowsPage windowsCatalogs={windowsCatalogs} />
      </div>
    </div>
  )
);
CategorySectionComponent.displayName = 'CategorySectionComponent';
const CategorySection = memo(CategorySectionComponent);
interface ClientUsedProductsPageProps {
  phoneCatalogs: IPhoneCatalog[];
  tabletCatalogs: ITabletCatalog[];
  macbookCatalogs: IMacbookCatalog[];
  windowsCatalogs: IWindowsCatalog[];
}

export default function ClientUsedProductsPage({ phoneCatalogs, tabletCatalogs, macbookCatalogs, windowsCatalogs }: ClientUsedProductsPageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('used-phone');

  const toggleMenu = useCallback(() => setIsOpen((prev) => !prev), []);

  const scrollToSection = useCallback((id: string) => {
    setSelectedCategory(id);
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        const offset = 0;
        const offsetTop = element.offsetTop;
        window.scrollTo({
          top: offsetTop - offset,
          behavior: 'smooth',
        });
      }
    }, 100);
  }, []);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 1,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setSelectedCategory(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    categories.forEach(({ id }) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div>
      <HeaderResponsive Title_NavbarMobile="7teck.vn" />
      <div>
        <div className="breadcrumbs px-[10px] text-sm text-black shadow xl:px-desktop-padding">
          <ul className="font-light">
            <li>
              <Link aria-label="Trang chủ" href="/">
                Trang Chủ
              </Link>
            </li>
            <li>
              <Link aria-label="Thiết bị qua sử dụng" href="">
                Thiết bị đã qua sử dụng
              </Link>
            </li>
          </ul>
        </div>

        <div className="relative">
          <CategoryMenu isOpen={isOpen} toggleMenu={toggleMenu} selectedCategory={selectedCategory} scrollToSection={scrollToSection} />
          <CategorySection
            isOpen={isOpen}
            phoneCatalogs={phoneCatalogs}
            tabletCatalogs={tabletCatalogs}
            macbookCatalogs={macbookCatalogs}
            windowsCatalogs={windowsCatalogs}
          />
        </div>
      </div>
    </div>
  );
}
