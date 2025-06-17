import React from 'react';
import { getAllPriceLists } from '@/services/priceListService';
import ClientPriceListPage from './ClientPriceListPage';
import ErrorLoading from '@/components/orther/error/ErrorLoading';

export default async function PriceListPage() {
  const priceLists = await getAllPriceLists();
  if (!priceLists) {
    return <ErrorLoading />;
  }
  return <ClientPriceListPage priceLists={priceLists} />;
}
