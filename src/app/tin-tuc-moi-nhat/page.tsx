import React from 'react';
import { getAllNews } from '@/services/postService';
import ClientNewsPage from './ClientNewsPage';
import ErrorLoading from '@/components/orther/error/ErrorLoading';

export default async function NewsPage() {
  const news = await getAllNews();
  if (!news) {
    return <ErrorLoading />;
  }
  return <ClientNewsPage news={news} />;
}
