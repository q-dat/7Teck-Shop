import React from 'react';
import { getAllPosts } from '@/services/postService';
import ClientNewsPage from './ClientNewsPage';

const posts = await getAllPosts();
export default function NewsPage() {
  return (
    <ClientNewsPage posts={posts} />
  )
}
