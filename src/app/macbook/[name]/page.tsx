import React from 'react';
import ClientUsedMacbookByCatalogPage from './ClientUsedMacbookByCatalogPage';
import { getAllMacbook } from '@/services/products/macbookService';

const macbook = await getAllMacbook();
export default function UsedMacbookByCatalogPage() {
  return <ClientUsedMacbookByCatalogPage macbook={macbook} />;
}
