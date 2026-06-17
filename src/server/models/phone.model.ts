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

export interface IPhone extends Document {
  _id: mongoose.Types.ObjectId;
  phone_catalog_id: mongoose.Types.ObjectId;
  name: string;
  slug?: string;
  view?: number;
  color: string;
  img: string;
  thumbnail?: string[];
  price: number;
  sale: number;
  status: string;
  des?: string;
  note?: string;
  createdAt?: Date;
  updatedAt?: Date;
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
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: 'phones' },
);

const PhoneModel = (mongoose.models.Phone as Model<IPhone> | undefined) ?? mongoose.model<IPhone>('Phone', PhoneSchema);

export default PhoneModel;
