import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface ITablet extends Document {
  _id: mongoose.Types.ObjectId;
  tablet_catalog_id: mongoose.Types.ObjectId;
  tablet_name: string;
  tablet_slug?: string;
  tablet_view?: number;
  tablet_color: string;
  tablet_img: string;
  tablet_thumbnail?: string[];
  tablet_price: number;
  tablet_sale: number;
  tablet_status: string;
  tablet_des?: string;
  tablet_note?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const TabletSchema = new Schema<ITablet>(
  {
    tablet_catalog_id: { type: Schema.Types.ObjectId, ref: 'TabletCatalog', required: true },
    tablet_name: { type: String, required: true },
    tablet_slug: { type: String, unique: true, index: true },
    tablet_view: { type: Number },
    tablet_color: { type: String, required: true },
    tablet_img: { type: String, required: true },
    tablet_thumbnail: { type: [String], default: [] },
    tablet_price: { type: Number, required: true },
    tablet_sale: { type: Number },
    tablet_status: { type: String, required: true },
    tablet_des: { type: String },
    tablet_note: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: 'tablets' },
);

const TabletModel = (mongoose.models.Tablet as Model<ITablet> | undefined) ?? mongoose.model<ITablet>('Tablet', TabletSchema);

export default TabletModel;
