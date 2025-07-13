import React from 'react';
import ClientTabletPage from './ClientTabletPage';
import { getAllNewTablets } from '@/services/products/tabletService';
import ErrorLoading from '@/components/orther/error/ErrorLoading';

export default async function TabletPage() {
  const tablets = await getAllNewTablets();
  if (!tablets) {
    return <ErrorLoading />;
  }
  return <ClientTabletPage tablets={tablets} />;
}
