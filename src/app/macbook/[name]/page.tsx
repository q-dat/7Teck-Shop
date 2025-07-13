import React from 'react';
import ClientUsedMacbookByCatalogPage from './ClientUsedMacbookByCatalogPage';
import { getAllNewMacbook } from '@/services/products/macbookService';
import ErrorLoading from '@/components/orther/error/ErrorLoading';

export default async function UsedMacbookByCatalogPage() {
  const macbook = await getAllNewMacbook();
  if (!macbook) {
    return <ErrorLoading />;
  }
  return <ClientUsedMacbookByCatalogPage macbook={macbook} />;
}
