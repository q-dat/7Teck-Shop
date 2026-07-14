import ErrorLoading from '@/components/orther/error/ErrorLoading';
import ClientWindowsPage from './ClientWindowsPage';
import { getGroupedWindows } from '@/services/products/windowsService';

export default async function WindowsPage() {
  const groupedWindows = await getGroupedWindows();
  if (!groupedWindows) {
    return <ErrorLoading />;
  }

  return <ClientWindowsPage groupedWindows={groupedWindows} />;
}
