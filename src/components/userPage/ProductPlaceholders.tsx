'use client';
import React from 'react';

const ProductPlaceholders = ({ count = 0 }: { count?: number }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="w-[185px]">
          <div className="animate-pulse space-y-2">
            <div className="h-[200px] w-full rounded-md bg-primary/20" />
            <div className="h-2 w-3/4 bg-primary/20" />
            <div className="h-2 w-full bg-primary/20" />
            <div className="h-2 w-5/6 bg-primary/20" />
          </div>
        </div>
      ))}
    </>
  );
};

export default ProductPlaceholders;
