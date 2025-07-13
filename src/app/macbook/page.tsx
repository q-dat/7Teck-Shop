import React from 'react';
import ClientMacbookPage from './ClientMacbookPage';
import { getAllNewMacbook } from '@/services/products/macbookService';
import ErrorLoading from '@/components/orther/error/ErrorLoading';

export default async function MacbookPage() {
  const macbook = await getAllNewMacbook();
  if (!macbook) {
    return <ErrorLoading />;
  }
  return <ClientMacbookPage macbook={macbook} />;
}
