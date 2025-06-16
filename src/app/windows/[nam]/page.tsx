import React from 'react';
import { getAllWindows } from '@/services/products/windowsService';
import ClientUsedWindowsByCatalogPage from './ClientUsedWindowsByCatalogPage';

const windows = await getAllWindows();
export default function UsedWindowByCatalogPage() {
  return <ClientUsedWindowsByCatalogPage windows={windows} />;
}
