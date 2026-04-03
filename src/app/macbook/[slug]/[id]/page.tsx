export const revalidate = 18000;

import ClientMacbookDetailPage from './ClientMacbookDetailPage';
import { IMacbook } from '@/types/type/products/macbook/macbook';
import { getMacbookWithFallback } from '@/services/products/macbookService';

type RouteParams = {
  slug: string;
  id: string;
};

export default async function MacbookDetailPage({ params }: { params: Promise<RouteParams> }) {
  const { id } = await params;

  const mac: IMacbook | null = await getMacbookWithFallback(id);

  if (!mac) {
    return <div className="mt-10 text-center">Không có dữ liệu.</div>;
  }

  return (
    <>
      <ClientMacbookDetailPage mac={mac} />
    </>
  );
}
