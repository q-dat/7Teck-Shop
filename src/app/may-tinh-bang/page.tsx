import { getAllTablets } from '@/services/products/tabletService';
import React from 'react';
import ClientTabletPage from './ClientTabletPage';

const tablets = await getAllTablets();
export default function TabletPage() {
  return <ClientTabletPage tablets={tablets} />;
}
