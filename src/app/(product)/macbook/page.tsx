import ClientMacbookPage from './ClientMacbookPage';
import { getGroupedMacbook } from '@/services/products/macbookService';
import ErrorLoading from '@/components/orther/error/ErrorLoading';

export default async function MacbookPage() {
  const groupedMacbook = await getGroupedMacbook();
  if (!groupedMacbook) {
    return <ErrorLoading />;
  }
  return <ClientMacbookPage groupedMacbook={groupedMacbook} />;
}
