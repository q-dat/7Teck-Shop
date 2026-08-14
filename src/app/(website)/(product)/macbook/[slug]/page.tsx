import React from 'react';
import ClientUsedMacbookByCatalogPage from './ClientUsedMacbookByCatalogPage';
import { getAllMacbook } from '@/services/products/macbookService';
import ErrorLoading from '@/components/orther/error/ErrorLoading';

export default async function UsedMacbookByCatalogPage() {
  const macbook = await getAllMacbook();
  if (!macbook) {
    return <ErrorLoading />;
  }
  return <ClientUsedMacbookByCatalogPage macbook={macbook} />;
}
