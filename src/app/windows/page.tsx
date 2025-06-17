import { getAllWindows } from '@/services/products/windowsService';
import React from 'react';
import ClientWindowsPage from './ClientWindowsPage';

const windows = await getAllWindows();
export default function WindowsPage() {
  return <ClientWindowsPage windows={windows} />;
}
