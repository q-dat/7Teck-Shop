import React from 'react';
import { getAllPosts } from '@/services/postService';
import ClientTipsAndTricksPage from './ClientTipsAndTricksPage';
import ErrorLoading from '@/components/orther/error/ErrorLoading';

export default async function TipsAndTricksPage() {
  const posts = await getAllPosts();
  if (!posts) {
    return <ErrorLoading />;
  }
  return <ClientTipsAndTricksPage posts={posts} />;
}
