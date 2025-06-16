import React from 'react';
import ClientUsedTabletByCatalogPage from './ClientUsedTabletByCatalogPage';
import { getAllTablets } from '@/services/products/tabletService';

const tablets = await getAllTablets();
export default function UsedTabletByCatalogPage() {
  return <ClientUsedTabletByCatalogPage tablets={tablets} />;
}
