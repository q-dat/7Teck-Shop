import React from 'react';
import ClientGalleryPage from './ClientGalleryPage';
import { getAllGallerys } from '@/services/galleryService';
import ErrorLoading from '@/components/orther/error/ErrorLoading';

export default async function GalleryPage() {
  const galleries = await getAllGallerys();
  if (!galleries) {
    return <ErrorLoading />;
  }
  return <ClientGalleryPage galleries={galleries} />;
}
