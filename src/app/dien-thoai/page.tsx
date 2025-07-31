// import React from 'react';
// import ClientPhonePage from './ClientPhonePage';
// import { getAllNewPhones } from '@/services/products/phoneService';
// import ErrorLoading from '@/components/orther/error/ErrorLoading';

// export default async function PhonePage() {
//   const phones = await getAllNewPhones();
//   if (!phones) {
//     return <ErrorLoading />;
//   }
//   return <ClientPhonePage phones={phones} />;
// }
import { getNewGroupedPhones } from '@/services/products/phoneService';
import ClientPhonePage from './ClientPhonePage';
import ErrorLoading from '@/components/orther/error/ErrorLoading';

export default async function PhonePage() {
  const groupedPhones = await getNewGroupedPhones();
  if (!groupedPhones) {
    return <ErrorLoading />;
  }

  return <ClientPhonePage groupedPhones={groupedPhones} />;
}
