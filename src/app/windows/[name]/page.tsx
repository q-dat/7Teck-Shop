import React from 'react';
import ClientUsedWindowsByCatalogPage from './ClientUsedWindowsByCatalogPage';
import { getAllWindows } from '@/services/products/windowsService';
import ErrorLoading from '@/components/orther/error/ErrorLoading';

export default async function UsedWindowByCatalogPage() {
  const windows = await getAllWindows();
  if (!windows) {
    return <ErrorLoading />;
  }
  return <ClientUsedWindowsByCatalogPage windows={windows} />;
}
