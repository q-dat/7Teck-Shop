import { getGroupedPhones } from '@/services/products/phoneService';
import ClientPhonePage from './ClientPhonePage';
import ErrorLoading from '@/components/orther/error/ErrorLoading';

export default async function PhonePage() {
  const groupedPhones = await getGroupedPhones();
  if (!groupedPhones) {
    return <ErrorLoading />;
  }

  return <ClientPhonePage groupedPhones={groupedPhones} />;
}
