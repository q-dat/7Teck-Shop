import { IPhone } from '@/types/type/products/phone/phone';
import mongoose, { Schema, model, models } from 'mongoose';

const phoneSchema = new Schema<IPhone>(
  {
    phone_catalog_id: { type: Schema.Types.ObjectId, ref: 'PhoneCatalog', required: true },
    view: Number,
    name: { type: String, required: true },
    color: String,
    img: String,
    thumbnail: [String],
    price: Number,
    sale: Number,
    status: String,
    des: String,
    note: String,
  },
  { timestamps: true }
);

export default mongoose.models.Phone || mongoose.model('Phone', phoneSchema, 'phones');
