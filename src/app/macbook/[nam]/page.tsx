import React from 'react';
import ClientUsedMacbookByCatalogPage from './ClientUsedMacbookByCatalogPage';
import { getAllMacbooks } from '@/services/products/macbookService';

const macbook = await getAllMacbooks();
export default function UsedMacbookByCatalogPage() {
  return <ClientUsedMacbookByCatalogPage macbook={macbook} />;
}
