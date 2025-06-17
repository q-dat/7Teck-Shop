import { getAllTablets } from '@/services/products/tabletService';
import React from 'react';
import ClientTabletPage from './ClientTabletPage';
import ErrorLoading from '@/components/orther/error/ErrorLoading';

const tablets = await getAllTablets();
export default function TabletPage() {
  if (!tablets) {
    return <ErrorLoading />;
  }
  return <ClientTabletPage tablets={tablets} />;
}
