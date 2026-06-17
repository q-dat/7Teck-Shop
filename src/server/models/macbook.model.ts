import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IMacbook extends Document {
  _id: mongoose.Types.ObjectId;
  macbook_catalog_id: mongoose.Types.ObjectId;
  macbook_name: string;
  macbook_slug?: string;
  macbook_view?: number;
  macbook_color: string;
  macbook_img: string;
  macbook_thumbnail?: string[];
  macbook_price: number;
  macbook_sale: number;
  macbook_status: string;
  macbook_des?: string;
  macbook_note?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

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
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: 'macbook' },
);

const MacbookModel =
  (mongoose.models.Macbook as Model<IMacbook> | undefined) ?? mongoose.model<IMacbook>('Macbook', MacbookSchema);

export default MacbookModel;
