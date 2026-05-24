import mongoose, { Model, Schema } from 'mongoose';

export interface IPhoneDocument {
  _id: mongoose.Types.ObjectId;
  phone_catalog_id: mongoose.Types.ObjectId;
  view?: number;
  views?: number;
  name: string;
  color: string;
  img: string;
  thumbnail?: string[];
  price: number;
  sale: number;
  status: string | number;
  des?: string;
  note?: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const PhoneSchema = new Schema<IPhoneDocument>(
  {
    phone_catalog_id: {
      type: Schema.Types.ObjectId,
      ref: 'PhoneCatalog',
      required: true,
      index: true,
    },
    view: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    color: {
      type: String,
      default: '',
      trim: true,
    },
    img: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: [String],
      default: [],
    },
    price: {
      type: Number,
      default: 0,
      index: true,
    },
    sale: {
      type: Number,
      default: 0,
    },
    status: {
      type: Schema.Types.Mixed,
      default: 0,
      index: true,
    },
    des: {
      type: String,
      default: '',
    },
    note: {
      type: String,
      default: '',
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'phones',
  }
);

const PhoneModel = (mongoose.models.Phone as Model<IPhoneDocument>) || mongoose.model<IPhoneDocument>('Phone', PhoneSchema);

export default PhoneModel;
