import React from 'react';
import ClientUsedPhoneByCatalogPage from './ClientUsedPhoneByCatalogPage';
import { getAllNewPhones } from '@/services/products/phoneService';
import ErrorLoading from '@/components/orther/error/ErrorLoading';

export default async function UsedPhoneByCatalogPage() {
  const phones = await getAllNewPhones();
  if (!phones) {
    return <ErrorLoading />;
  }
  return <ClientUsedPhoneByCatalogPage phones={phones} />;
}
