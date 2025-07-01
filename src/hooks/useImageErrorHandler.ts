import { useState } from 'react';

export const useImageErrorHandler = () => {
  const [erroredImages, setErroredImages] = useState<Record<string, boolean>>({});

  const handleImageError = (id: string) => {
    setErroredImages((prev) => ({ ...prev, [id]: true }));
  };

  const isImageErrored = (id: string): boolean => {
    return erroredImages[id] ?? false;
  };

  return { handleImageError, isImageErrored };
};
