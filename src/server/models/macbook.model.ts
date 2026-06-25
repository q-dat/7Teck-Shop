import { IMacbook } from '@/types/type/products/macbook/macbook';
import mongoose, { Schema, type Model } from 'mongoose';

const MacbookSchema = new Schema<IMacbook>(
  {
    macbook_catalog_id: { type: Schema.Types.ObjectId, ref: 'MacbookCatalog', required: true },
    macbook_name: { type: String, required: true },
    macbook_slug: { type: String, unique: true, index: true },
    macbook_view: { type: Number },
    macbook_color: { type: String, required: true },
    macbook_img: { type: String, required: true },
    macbook_thumbnail: { type: [String], default: [] },
    macbook_price: { type: Number, required: true },
    macbook_sale: { type: Number },
    macbook_status: { type: String, required: true },
    macbook_des: { type: String },
    macbook_note: { type: String },
  },
  { collection: 'macbook' }
);

const MacbookModel = (mongoose.models.Macbook as Model<IMacbook> | undefined) ?? mongoose.model<IMacbook>('Macbook', MacbookSchema);

export default MacbookModel;
