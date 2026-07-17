import React from 'react';
import { getAllPriceLists } from '@/services/priceListService';
import ClientPriceListPage from './ClientPriceListPage';
import ErrorLoading from '@/components/orther/error/ErrorLoading';
import { IPriceListApi } from '@/types/type/price-list/price-list';
import { buildPageMetadata } from '@/app/(SEO)/lib/seo';

export const metadata = buildPageMetadata({
  path: '/bang-gia-thu-mua',
  title: 'Bảng giá thu mua điện thoại, laptop, MacBook cũ giá cao | 7Teck.vn',
  description:
    'Cập nhật bảng giá thu mua điện thoại, máy tính bảng, laptop, MacBook cũ giá cao nhất thị trường tại 7Teck.vn. Thu mua tận nơi, thanh toán ngay, bảo mật thông tin.',
  keywords: ['thu mua điện thoại', 'thu mua laptop', 'thu mua MacBook', 'bảng giá thu mua', 'thu mua giá cao', '7Teck.vn'],
});

export default async function PriceListPage() {
  let priceLists: IPriceListApi[] | null = null;

  try {
    const response = await getAllPriceLists();
    priceLists = response?.priceLists || [];
  } catch (error) {
    console.error('Lỗi khi lấy bảng giá:', error);
    priceLists = null;
  }

  if (!priceLists) return <ErrorLoading />;

  return <ClientPriceListPage priceLists={priceLists} />;
}
