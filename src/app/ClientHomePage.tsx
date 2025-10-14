'use client';
import HeaderResponsive from '@/components/userPage/ui/HeaderResponsive';
import { useEffect, useState } from 'react';
import ClientPhoneFC from '../components/userPage/ClientPhoneFC';
import ClientProductFC, { Product } from '../components/userPage/page/ClientProductFC';
import ClientPostSection from '../components/userPage/ClientPostSection';
import { IMacbook } from '@/types/type/products/macbook/macbook';
import { IPost } from '@/types/type/products/post/post';
import { IPhone } from '@/types/type/products/phone/phone';
import { ITablet } from '@/types/type/products/tablet/tablet';
import { IWindows } from '@/types/type/products/windows/windows';
import BgFixedSection from '@/components/userPage/BgFixedSection';
import BenefitsSection from '@/components/userPage/BenefitsSection';
import ZigzagSection from '@/components/userPage/ZigzagSection/ZigzagSection';
import HeroBanner from '@/components/userPage/HeroBanner';

interface ClientHomePageProps {
  mostViewedPhones: IPhone[];
  macbook: IMacbook[];
  tablets: ITablet[];
  windows: IWindows[];
  news: IPost[];
  tricks: IPost[];
}

export default function ClientHomePage({ mostViewedPhones, tablets, macbook, windows, news, tricks }: ClientHomePageProps) {
  const [loading, setLoading] = useState(true);

  // Kiểm tra trạng thái tải dựa trên mostViewedPhones
  useEffect(() => {
    if (mostViewedPhones.length === 0) {
      const fetchData = async () => {
        setLoading(true);
      };
      fetchData();
    } else {
      setLoading(false);
    }
  }, [mostViewedPhones]);

  // Ánh xạ dữ liệu
  const transformTablets: Product[] = tablets.map((item) => ({
    _id: item._id,
    name: item.tablet_name || '',
    price: item.tablet_price || 0,
    sale: item.tablet_sale || 0,
    image: item.tablet_img || '',
    status: item.tablet_status || '',
    color: item.tablet_color || '',
    ram: item.tablet_catalog_id.t_cat_memory_and_storage.t_cat_ram || '',
  }));

  const transformMacbook: Product[] = macbook.map((item) => ({
    _id: item._id,
    name: item.macbook_name || '',
    price: item.macbook_price || 0,
    sale: item.macbook_sale || 0,
    image: item.macbook_img || '',
    status: item.macbook_status || '',
    color: item.macbook_color || '',
    ram: item.macbook_catalog_id.m_cat_memory_and_storage.m_cat_ram || '',
  }));

  const transformWindows: Product[] = windows.map((item) => ({
    _id: item._id,
    name: item.windows_name || '',
    price: item.windows_price || 0,
    sale: item.windows_sale || 0,
    image: item.windows_img || '',
    status: item.windows_status || '',
    color: item.windows_color || '',
    ram: item.windows_catalog_id.w_cat_memory_and_storage.w_cat_ram || '',
  }));

  // Cấu hình danh mục sản phẩm
  const productCategories: Array<{
    products: Product[];
    category: {
      name: string;
      url: string;
      title: string;
      ariaLabel: string;
    };
  }> = [
    {
      products: transformTablets,
      category: {
        name: 'Máy Tính Bảng',
        url: '/may-tinh-bang',
        title: 'Máy Tính Bảng - Giảm giá mạnh',
        ariaLabel: 'Xem thêm sản phẩm máy tính bảng',
      },
    },
    {
      products: transformMacbook,
      category: {
        name: 'Laptop Macbook',
        url: '/macbook',
        title: 'Macbook - Giảm giá mạnh',
        ariaLabel: 'Xem thêm sản phẩm laptop Macbook',
      },
    },
    {
      products: transformWindows,
      category: {
        name: 'Laptop Windows',
        url: '/windows',
        title: 'Windows - Giảm giá mạnh',
        ariaLabel: 'Xem thêm sản phẩm laptop Windows',
      },
    },
  ];

  return (
    <div className="w-full">
      <HeaderResponsive Title_NavbarMobile="7teck.vn" />
      <div className="pt-[60px] xl:pt-0">
        <HeroBanner /> {/* Mobile */}
        <ZigzagSection mostViewedPhones={mostViewedPhones} loading={loading} /> {/* Desktop */}
        <ClientPhoneFC mostViewedPhones={mostViewedPhones} loading={loading} />
        <BgFixedSection className="block xl:hidden" />
        {productCategories.map((config, index) => (
          <div key={index} /* data-aos="fade-up" */ className="mt-0 w-full xl:mt-10">
            <ClientProductFC products={config.products} category={config.category} loading={loading} />
          </div>
        ))}
        <BgFixedSection className="hidden xl:block" />
        <BenefitsSection />
        <ClientPostSection news={news} tricks={tricks} />
      </div>
    </div>
  );
}
