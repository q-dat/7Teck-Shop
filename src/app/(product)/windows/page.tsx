import ErrorLoading from '@/components/orther/error/ErrorLoading';
import ClientWindowsPage from './ClientWindowsPage';
import { getNewGroupedWindows } from '@/services/products/windowsService';

export default async function WindowsPage() {
  const groupedWindows = await getNewGroupedWindows();
  if (!groupedWindows) {
    return <ErrorLoading />;
  }

  return <ClientWindowsPage groupedWindows={groupedWindows} />;
}
