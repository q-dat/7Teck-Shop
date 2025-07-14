import React from 'react';
import ClientUsedPhoneByCatalogPage from './ClientUsedPhoneByCatalogPage';
import { getAllPhones } from '@/services/products/phoneService';
import ErrorLoading from '@/components/orther/error/ErrorLoading';

export default async function UsedPhoneByCatalogPage() {
  const phones = await getAllPhones();
  if (!phones) {
    return <ErrorLoading />;
  }
  return <ClientUsedPhoneByCatalogPage phones={phones} />;
}
