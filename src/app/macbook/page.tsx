import React from 'react';
import ClientMacbookPage from './ClientMacbookPage';
import { getAllMacbook } from '@/services/products/macbookService';
import ErrorLoading from '@/components/orther/error/ErrorLoading';

const macbook = await getAllMacbook();
export default function MacbookPage() {
  if (!macbook) {
    return <ErrorLoading />;
  }
  return <ClientMacbookPage macbook={macbook} />;
}
