import { getAllWindows } from '@/services/products/windowsService';
import React from 'react';
import ClientWindowsPage from './ClientWindowsPage';
import ErrorLoading from '@/components/orther/error/ErrorLoading';

const windows = await getAllWindows();
export default function WindowsPage() {
  if (!windows) {
    return <ErrorLoading />;
  }
  return <ClientWindowsPage windows={windows} />;
}
