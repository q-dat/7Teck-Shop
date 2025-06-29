import { ITablet } from '@/types/type/products/tablet/tablet';
import mongoose, { Schema} from 'mongoose';

const tabletSchema = new Schema<ITablet>(
  {
    tablet_catalog_id: { type: Schema.Types.ObjectId, ref: 'TabletCatalog', required: true },
    tablet_view: Number,
    tablet_name: { type: String, required: true },
    tablet_color: String,
    tablet_img: String,
    tablet_thumbnail: [String],
    tablet_price: Number,
    tablet_sale: Number,
    tablet_status: String,
    tablet_des: String,
    tablet_note: String,
  },
  { timestamps: true }
);

export default mongoose.models.Tablet || mongoose.model('Tablet', tabletSchema, 'tablets');
