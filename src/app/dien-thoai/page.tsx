import React from 'react';
import ClientPhonePage from './ClientPhonePage';
import { getAllPhones } from '@/services/products/phoneService';
import ErrorLoading from '@/components/orther/error/ErrorLoading';

const phones = await getAllPhones();
export default function PhonePage() {
  if (!phones) {
    return <ErrorLoading />;
  }
  return <ClientPhonePage phones={phones} />;
}
