import React from 'react';
import { getAllPosts } from '@/services/postService';
import ClientTipsAndTricksPage from './ClientTipsAndTricksPage';

const posts = await getAllPosts();
export default function TipsAndTricksPage() {
  return <ClientTipsAndTricksPage posts={posts} />;
}
