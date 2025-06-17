import { PageProps } from '@/types/type/pages/page-props';
import React from 'react';
import ClientPostDetailPage from './ClientPostDetailPage';
import { getAllPosts, getPostById } from '@/services/postService';
import { IPost } from '@/types/type/post/post';
import ErrorLoading from '@/components/orther/error/ErrorLoading';

export default async function PostDetail({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const posts: IPost[] = await getAllPosts();
  const post: IPost | null = await getPostById(id);

  if (!posts) {
    return <ErrorLoading />;
  }

  return <ClientPostDetailPage posts={posts} post={post} />;
}
