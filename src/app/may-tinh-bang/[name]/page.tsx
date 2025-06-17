import React from 'react';
import ClientUsedTabletByCatalogPage from './ClientUsedTabletByCatalogPage';
import { getAllTablets } from '@/services/products/tabletService';
import ErrorLoading from '@/components/orther/error/ErrorLoading';

export default async function UsedTabletByCatalogPage() {
  const tablets = await getAllTablets();
  if (!tablets) {
    return <ErrorLoading />;
  }
  return <ClientUsedTabletByCatalogPage tablets={tablets} />;
}
