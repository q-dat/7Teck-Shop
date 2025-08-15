import React from 'react';
import { getAllTipsAndTricks } from '@/services/postService';
import ClientTipsAndTricksPage from './ClientTipsAndTricksPage';
import ErrorLoading from '@/components/orther/error/ErrorLoading';

export default async function TipsAndTricksPage() {
  const tricks = await getAllTipsAndTricks();
  if (!tricks) {
    return <ErrorLoading />;
  }
  return <ClientTipsAndTricksPage tricks={tricks} />;
}
