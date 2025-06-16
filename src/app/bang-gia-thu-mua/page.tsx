import React from 'react';
import { getAllPriceLists } from '@/services/priceListService';
import ClientPriceListPage from './ClientPriceListPage';

const priceLists = await getAllPriceLists();
export default function PriceListPage() {
  return <ClientPriceListPage priceLists={priceLists} />;
}
