import { ITablet } from '@/types/type/products/tablet/tablet';
import mongoose, { Schema, type Model } from 'mongoose';

const TabletSchema = new Schema<ITablet>(
  {
    tablet_catalog_id: { type: Schema.Types.ObjectId, ref: 'TabletCatalog', required: true },
    tablet_name: { type: String, required: true },
    tablet_slug: { type: String, unique: true, index: true },
    tablet_view: { type: Number },
    tablet_color: { type: String, required: true },
    tablet_img: { type: String, required: true },
    tablet_thumbnail: { type: [String], default: [] },
    tablet_price: { type: Number, required: true },
    tablet_sale: { type: Number },
    tablet_status: { type: String, required: true },
    tablet_des: { type: String },
    tablet_note: { type: String },
  },
  { collection: 'tablets' }
);

const TabletModel = (mongoose.models.Tablet as Model<ITablet> | undefined) ?? mongoose.model<ITablet>('Tablet', TabletSchema);

export default TabletModel;
