import React from 'react';
import ClientMacbookPage from './ClientMacbookPage';
import { getAllMacbook } from '@/services/products/macbookService';

const macbook = await getAllMacbook();
export default function MacbookPage() {
  return <ClientMacbookPage macbook={macbook} />;
}
