import '@/server/models/registerModels';
import { connectDB } from '@/lib/mongodb';
import GalleryModel from '@/server/models/gallery.model';
import { IGallery } from '@/types/type/gallery/gallery';

export async function getGalleriesData(): Promise<IGallery[]> {
  await connectDB();

  const galleries = await GalleryModel.find({})
    .sort({ createdAt: -1 })
    .lean();

  return galleries as unknown as IGallery[];
}

export async function getGalleryByIdData(id: string): Promise<IGallery | null> {
  await connectDB();

  const gallery = await GalleryModel.findById(id).lean();

  if (!gallery) return null;

  return gallery as unknown as IGallery;
}
