import React from 'react';
import ClientPhonePage from './ClientPhonePage';
import { getAllPhones } from '@/services/products/phoneService';

const phones = await getAllPhones();
export default function PhonePage() {
  return <ClientPhonePage phones={phones} />;
}
