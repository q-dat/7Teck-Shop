import ClientTabletPage from './ClientTabletPage';
import ErrorLoading from '@/components/orther/error/ErrorLoading';
import { getGroupedTablets } from '@/services/products/tabletService';

export default async function TabletPage() {
  const groupedTablets = await getGroupedTablets();
  if (!groupedTablets) {
    return <ErrorLoading />;
  }
  return <ClientTabletPage groupedTablets={groupedTablets} />;
}
