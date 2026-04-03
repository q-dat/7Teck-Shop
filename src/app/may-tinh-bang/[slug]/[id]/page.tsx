export const revalidate = 18000;

import { ITablet } from '@/types/type/products/tablet/tablet';
import { getTabletWithFallback } from '@/services/products/tabletService';
import ClientTabletDetailPage from './ClientTabletDetailPage';

type RouteParams = {
  slug: string;
  id: string;
};

export default async function TabletDetailPage({ params }: { params: Promise<RouteParams> }) {
  const { id } = await params;

  const tablet: ITablet | null = await getTabletWithFallback(id);

  if (!tablet) {
    return <div className="mt-10 text-center">Không có dữ liệu.</div>;
  }

  return (
    <>
      <ClientTabletDetailPage tablet={tablet} />
    </>
  );
}
