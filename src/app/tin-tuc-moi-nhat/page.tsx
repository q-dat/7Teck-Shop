import React from 'react';
import { getAllPosts } from '@/services/postService';
import ClientNewsPage from './ClientNewsPage';
import ErrorLoading from '@/components/orther/error/ErrorLoading';

export default async function NewsPage() {
  const posts = await getAllPosts();
  if (!posts) {
    return <ErrorLoading />;
  }
  return <ClientNewsPage posts={posts} />;
}
