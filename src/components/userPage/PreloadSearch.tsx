'use client';
import { searchProducts } from '@/services/searchService';
import { useEffect } from 'react';

export const PreloadSearch = ({ query }: { query: string }) => {
  useEffect(() => {
    (async () => {
      try {
        await searchProducts(query);
      } catch (error) {
        console.error('Error preloading search:', error);
      }
    })();
  }, [query]);

  return null;
};
