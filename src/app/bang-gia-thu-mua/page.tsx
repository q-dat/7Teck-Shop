import React from 'react';
import { getAllPriceLists } from '@/services/priceListService';
import ClientPriceListPage from './ClientPriceListPage';
import ErrorLoading from '@/components/orther/error/ErrorLoading';
import { IPriceListApi } from '@/types/type/price-list/price-list';

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
