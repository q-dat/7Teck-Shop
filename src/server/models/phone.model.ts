import { IPhone } from '@/types/type/products/phone/phone';
import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface StatusQuery {
  status?: string;
  hasProduct?: string;
}

export interface PhoneQuery extends StatusQuery {
  price?: string;
  minPrice?: string;
  maxPrice?: string;
  color?: string;
  ram?: string;
  storage?: string;
  sort?: 'price_asc' | 'price_desc' | 'newest';
}


const PhoneSchema = new Schema<IPhone>(
  {
    phone_catalog_id: { type: Schema.Types.ObjectId, ref: 'PhoneCatalog', required: true },
    name: { type: String, required: true },
    slug: { type: String, unique: true, index: true },
    view: { type: Number },
    color: { type: String, required: true },
    img: { type: String, required: true },
    thumbnail: { type: [String], default: [] },
    price: { type: Number, required: true },
    sale: { type: Number },
    status: { type: String, required: true },
    des: { type: String },
    note: { type: String },
  },
  { collection: 'phones' },
);

const PhoneModel = (mongoose.models.Phone as Model<IPhone> | undefined) ?? mongoose.model<IPhone>('Phone', PhoneSchema);

export default PhoneModel;
