import React from 'react';
import ClientUsedPhoneByCatalogPage from './ClientUsedPhoneByCatalogPage';
import { getAllPhones } from '@/services/products/phoneService';

const phones = await getAllPhones()
export default function UsedPhoneByCatalogPage() {
  return <ClientUsedPhoneByCatalogPage phones={phones} />;
}
