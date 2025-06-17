import React from 'react';
import ClientPhonePage from './ClientPhonePage';
import { getAllPhones } from '@/services/products/phoneService';
import ErrorLoading from '@/components/orther/error/ErrorLoading';

export default async function PhonePage() {
  const phones = await getAllPhones();
  if (!phones) {
    return <ErrorLoading />;
  }
  return <ClientPhonePage phones={phones} />;
}
