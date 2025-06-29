import { IMacbook } from '@/types/type/products/macbook/macbook';
import mongoose, { Schema, model, models } from 'mongoose';

const macbookSchema = new Schema<IMacbook>(
  {
    macbook_catalog_id: { type: Schema.Types.ObjectId, ref: 'MacbookCatalog', required: true },
    macbook_view: Number,
    macbook_name: { type: String, required: true },
    macbook_color: String,
    macbook_img: String,
    macbook_thumbnail: [String],
    macbook_price: Number,
    macbook_sale: Number,
    macbook_status: String,
    macbook_des: String,
    macbook_note: String,
  },
  { timestamps: true }
);

export default mongoose.models.Macbook || mongoose.model('Macbook', macbookSchema, 'macbook');
