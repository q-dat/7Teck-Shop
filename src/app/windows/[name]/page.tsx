import React from 'react';
import ClientUsedWindowsByCatalogPage from './ClientUsedWindowsByCatalogPage';
import { getAllNewWindows } from '@/services/products/windowsService';
import ErrorLoading from '@/components/orther/error/ErrorLoading';

export default async function UsedWindowByCatalogPage() {
  const windows = await getAllNewWindows();
  if (!windows) {
    return <ErrorLoading />;
  }
  return <ClientUsedWindowsByCatalogPage windows={windows} />;
}
