import React from 'react';
import { getAllPriceLists } from '@/services/priceListService';
import ClientPriceListPage from './ClientPriceListPage';
import ErrorLoading from '@/components/orther/error/ErrorLoading';

const priceLists = await getAllPriceLists();
export default function PriceListPage() {
  if (!priceLists) {
    return <ErrorLoading />;
  }
  return <ClientPriceListPage priceLists={priceLists} />;
}
