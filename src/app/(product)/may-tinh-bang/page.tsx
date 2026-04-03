import ClientTabletPage from './ClientTabletPage';
import ErrorLoading from '@/components/orther/error/ErrorLoading';
import { getNewGroupedTablets } from '@/services/products/tabletService';

export default async function TabletPage() {
  const groupedTablets = await getNewGroupedTablets();
  if (!groupedTablets) {
    return <ErrorLoading />;
  }
  return <ClientTabletPage groupedTablets={groupedTablets} />;
}
