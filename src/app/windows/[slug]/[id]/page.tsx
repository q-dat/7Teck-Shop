export const revalidate = 18000;

import ClientWindowsDetailPage from './ClientWindowsDetailPage';
import { IWindows } from '@/types/type/products/windows/windows';
import { getWindowsWithFallback } from '@/services/products/windowsService';

type RouteParams = {
  slug: string;
  id: string;
};

export default async function WindowsDetailPage({ params }: { params: Promise<RouteParams> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const win: IWindows | null = await getWindowsWithFallback(id);

  if (!win) {
    return <div className="mt-10 text-center">Không có dữ liệu.</div>;
  }

  return (
    <>
      <ClientWindowsDetailPage win={win} />
    </>
  );
}
