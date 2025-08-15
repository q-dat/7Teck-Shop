import React from 'react';
import { getAllNews } from '@/services/postService';
import ClientNewsPage from './ClientNewsPage';
import ErrorLoading from '@/components/orther/error/ErrorLoading';

export default async function NewsPage() {
  const posts = await getAllNews();
  if (!posts) {
    return <ErrorLoading />;
  }
  return <ClientNewsPage posts={posts} />;
}
