import { IGallery } from '@/types/type/gallery/gallery';
import mongoose, { Schema, type Model } from 'mongoose';

const GallerySchema = new Schema<IGallery>(
  {
    name: { type: String },
    gallery: { type: [String], default: [] },
    des: { type: String },
  },
  { collection: 'galleries', timestamps: true },
);

const GalleryModel = (mongoose.models.Gallery as Model<IGallery> | undefined) ?? mongoose.model<IGallery>('Gallery', GallerySchema);

export default GalleryModel;
