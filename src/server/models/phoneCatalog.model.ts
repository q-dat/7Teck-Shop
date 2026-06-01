import mongoose, { Model, Schema } from 'mongoose';

export interface IPhoneCatalogDocument {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug?: string;
  img?: string;
  price?: number;
  status?: string | number;
  createdAt: Date;
  updatedAt: Date;
}

const PhoneCatalogSchema = new Schema<IPhoneCatalogDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
      index: true,
    },
    img: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      default: 0,
    },
    status: {
      type: Schema.Types.Mixed,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: 'phonecatalogs',
  }
);

const PhoneCatalogModel =
  (mongoose.models.PhoneCatalog as Model<IPhoneCatalogDocument>) || mongoose.model<IPhoneCatalogDocument>('PhoneCatalog', PhoneCatalogSchema);

export default PhoneCatalogModel;
