import React from 'react';
import { getAllTipsAndTricks } from '@/services/postService';
import ClientTipsAndTricksPage from './ClientTipsAndTricksPage';
import ErrorLoading from '@/components/orther/error/ErrorLoading';

export default async function TipsAndTricksPage() {
  const posts = await getAllTipsAndTricks();
  if (!posts) {
    return <ErrorLoading />;
  }
  return <ClientTipsAndTricksPage posts={posts} />;
}
