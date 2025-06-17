import { getAllTablets } from '@/services/products/tabletService';
import React from 'react';
import ClientTabletPage from './ClientTabletPage';
import ErrorLoading from '@/components/orther/error/ErrorLoading';

export default async function TabletPage() {
  const tablets = await getAllTablets();
  if (!tablets) {
    return <ErrorLoading />;
  }
  return <ClientTabletPage tablets={tablets} />;
}
