import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IWindows extends Document {
  _id: mongoose.Types.ObjectId;
  windows_catalog_id: mongoose.Types.ObjectId;
  windows_name: string;
  windows_slug: string;
  windows_view?: number;
  windows_color: string;
  windows_img: string;
  windows_thumbnail?: string[];
  windows_price: number;
  windows_sale: number;
  windows_status: string;
  windows_des?: string;
  windows_note?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const WindowsSchema = new Schema<IWindows>(
  {
    windows_catalog_id: { type: Schema.Types.ObjectId, ref: 'WindowsCatalog', required: true },
    windows_name: { type: String, required: true },
    windows_slug: { type: String, unique: true, index: true },
    windows_view: { type: Number },
    windows_color: { type: String, required: true },
    windows_img: { type: String, required: true },
    windows_thumbnail: { type: [String], default: [] },
    windows_price: { type: Number, required: true },
    windows_sale: { type: Number },
    windows_status: { type: String, required: true },
    windows_des: { type: String },
    windows_note: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: 'windows' },
);

const WindowsModel =
  (mongoose.models.Windows as Model<IWindows> | undefined) ?? mongoose.model<IWindows>('Windows', WindowsSchema);

export default WindowsModel;
