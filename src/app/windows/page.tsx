import React from 'react';
import ClientWindowsPage from './ClientWindowsPage';
import { getAllNewWindows } from '@/services/products/windowsService';
import ErrorLoading from '@/components/orther/error/ErrorLoading';

export default async function WindowsPage() {
  const windows = await getAllNewWindows();
  if (!windows) {
    return <ErrorLoading />;
  }
  return <ClientWindowsPage windows={windows} />;
}
