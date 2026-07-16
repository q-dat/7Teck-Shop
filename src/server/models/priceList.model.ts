import { IPriceListApi, IProductGroup, IProductVariant } from '@/types/type/price-list/price-list';
import mongoose, { Schema, type Model } from 'mongoose';

const ProductVariantSchema = new Schema<IProductVariant>(
  {
    _id: { type: String },
    name: { type: String, required: true },
    price_new: { type: Number, default: null },
    price_used: { type: Number, default: null },
    condition: { type: String, default: '' },
    storage: { type: String },
  },
  { _id: false },
);

const ProductGroupSchema = new Schema<IProductGroup>(
  {
    catalog: { type: String, required: true },
    variants: { type: [ProductVariantSchema], default: [] },
  },
  { _id: false },
);

const PriceListSchema = new Schema<IPriceListApi>(
  {
    category: { type: String, required: true },
    price_new: { type: Number, default: null },
    price_used: { type: Number, default: null },
    conditions: { type: String },
    groups: { type: [ProductGroupSchema], default: [] },
  },
  { collection: 'pricelists', timestamps: true },
);

const PriceListModel = (mongoose.models.PriceList as Model<IPriceListApi> | undefined) ?? mongoose.model<IPriceListApi>('PriceList', PriceListSchema);

export default PriceListModel;
