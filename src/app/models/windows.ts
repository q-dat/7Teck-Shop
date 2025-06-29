import { IWindows } from '@/types/type/products/windows/windows';
import mongoose, { Schema, model, models } from 'mongoose';

const windowsSchema = new Schema<IWindows>(
  {
    windows_catalog_id: { type: Schema.Types.ObjectId, ref: 'WindowsCatalog', required: true },
    windows_view: Number,
    windows_name: { type: String, required: true },
    windows_color: String,
    windows_img: String,
    windows_thumbnail: [String],
    windows_price: Number,
    windows_sale: Number,
    windows_status: String,
    windows_des: String,
    windows_note: String,
  },
  { timestamps: true }
);

export default mongoose.models.Windows || mongoose.model('Windows', windowsSchema, 'windows');
