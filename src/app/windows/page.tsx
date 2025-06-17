import { getAllWindows } from '@/services/products/windowsService';
import React from 'react';
import ClientWindowsPage from './ClientWindowsPage';
import ErrorLoading from '@/components/orther/error/ErrorLoading';

export default async function WindowsPage() {
  const windows = await getAllWindows();
  if (!windows) {
    return <ErrorLoading />;
  }
  return <ClientWindowsPage windows={windows} />;
}
