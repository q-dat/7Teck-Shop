import React from 'react';
import ClientGalleryPage from './ClientGalleryPage';
import { getAllGallerys } from '@/services/galleryService';

const galleries = await getAllGallerys()
export default function GalleryPage() {
  return <ClientGalleryPage galleries={galleries} />;
}
