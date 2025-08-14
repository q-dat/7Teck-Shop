// import React from 'react';
// import ClientWindowsPage from './ClientWindowsPage';
// import { getAllNewWindows } from '@/services/products/windowsService';
// import ErrorLoading from '@/components/orther/error/ErrorLoading';

// export default async function WindowsPage() {
//   const windows = await getAllNewWindows();
//   if (!windows) {
//     return <ErrorLoading />;
//   }
//   return <ClientWindowsPage windows={windows} />;
// }
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
