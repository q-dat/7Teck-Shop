'use client';
import { searchProducts } from '@/services/searchService';
import { useEffect } from 'react';

export const PreloadSearch = ({ query }: { query: string }) => {
  useEffect(() => {
    searchProducts(query).then((results) => {
      console.log('Preloaded in client:', results);
    });
  }, [query]);

  return null;
};
