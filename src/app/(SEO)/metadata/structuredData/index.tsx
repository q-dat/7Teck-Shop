'use client';
import React from 'react';

type StructuredDataType = {
  '@context': string;
  '@type': string;
  [key: string]: unknown;
};

type StructuredDataProps = {
  data: StructuredDataType;
};

export const StructuredData: React.FC<StructuredDataProps> = ({ data }) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
};
