import React from 'react';
import ClientMacbookPage from './ClientMacbookPage';
import { getAllMacbook } from '@/services/products/macbookService';
import ErrorLoading from '@/components/orther/error/ErrorLoading';

export default async function MacbookPage() {
  const macbook = await getAllMacbook();
  if (!macbook) {
    return <ErrorLoading />;
  }
  return <ClientMacbookPage macbook={macbook} />;
}
