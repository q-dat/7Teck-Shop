import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITabletCatalog extends Document {
  _id: mongoose.Types.ObjectId;
  t_cat_name: string;
  t_cat_slug: string;
  t_cat_img: string;
  t_cat_price: number;
  t_cat_status: number;
  t_cat_content?: string;
  createdAt?: Date;
  updatedAt?: Date;
  t_cat_display?: {
    t_cat_screen_technology?: string;
    t_cat_resolution?: string;
    t_cat_screen_size?: string;
  };
  t_cat_operating_system_and_cpu?: {
    t_cat_cpu_chip?: string;
    t_cat_cpu_speed?: string;
    t_cat_gpu?: string;
  };
  t_cat_memory_and_storage?: {
    t_cat_ram?: string;
    t_cat_storage_capacity?: string;
    t_cat_available_storage?: string;
  };
  t_cat_rear_camera?: {
    t_cat_resolution?: string;
    t_cat_video_recording?: string[];
    t_cat_features?: string[];
  };
  t_cat_front_camera?: {
    t_cat_resolution?: string;
    t_cat_features?: string[];
  };
  t_cat_connectivity?: {
    t_cat_mobile_network?: string;
    t_cat_sim?: string;
    t_cat_calls?: string;
    t_cat_wifi?: string[];
    t_cat_gps?: string[];
    t_cat_bluetooth?: string;
    t_cat_charging_port?: string;
    t_cat_headphone_jack?: string;
  };
  t_cat_features?: {
    t_cat_special_features?: string[];
  };
  t_cat_battery_and_charging?: {
    t_cat_battery_capacity?: string;
    t_cat_battery_type?: string;
    t_cat_battery_technology?: string[];
    t_cat_max_charging_support?: string;
    t_cat_included_charger?: string;
  };
  t_cat_general_information?: {
    t_cat_material?: string;
    t_cat_dimensions_and_weight?: string;
    t_cat_launch_date?: string;
    t_cat_brand?: string;
  };
}

const TabletCatalogSchema = new Schema<ITabletCatalog>(
  {
    t_cat_name: { type: String, required: true },
    t_cat_slug: { type: String, unique: true, index: true },
    t_cat_img: { type: String, required: true },
    t_cat_price: { type: Number, required: true },
    t_cat_status: { type: Number, required: true },
    t_cat_content: { type: String },
    t_cat_display: {
      t_cat_screen_technology: { type: String },
      t_cat_resolution: { type: String },
      t_cat_screen_size: { type: String },
    },
    t_cat_operating_system_and_cpu: {
      t_cat_cpu_chip: { type: String },
      t_cat_cpu_speed: { type: String },
      t_cat_gpu: { type: String },
    },
    t_cat_memory_and_storage: {
      t_cat_ram: { type: String },
      t_cat_storage_capacity: { type: String },
      t_cat_available_storage: { type: String },
    },
    t_cat_rear_camera: {
      t_cat_resolution: { type: String },
      t_cat_video_recording: { type: [String] },
      t_cat_features: { type: [String] },
    },
    t_cat_front_camera: {
      t_cat_resolution: { type: String },
      t_cat_features: { type: [String] },
    },
    t_cat_connectivity: {
      t_cat_mobile_network: { type: String },
      t_cat_sim: { type: String },
      t_cat_calls: { type: String },
      t_cat_wifi: { type: [String] },
      t_cat_gps: { type: [String] },
      t_cat_bluetooth: { type: String },
      t_cat_charging_port: { type: String },
      t_cat_headphone_jack: { type: String },
    },
    t_cat_features: {
      t_cat_special_features: { type: [String] },
    },
    t_cat_battery_and_charging: {
      t_cat_battery_capacity: { type: String },
      t_cat_battery_type: { type: String },
      t_cat_battery_technology: { type: [String] },
      t_cat_max_charging_support: { type: String },
      t_cat_included_charger: { type: String },
    },
    t_cat_general_information: {
      t_cat_material: { type: String },
      t_cat_dimensions_and_weight: { type: String },
      t_cat_launch_date: { type: String },
      t_cat_brand: { type: String },
    },
  },
  { timestamps: true, collection: 'tabletcatalogs' },
);

const TabletCatalogModel =
  (mongoose.models.TabletCatalog as Model<ITabletCatalog> | undefined) ??
  mongoose.model<ITabletCatalog>('TabletCatalog', TabletCatalogSchema);

export default TabletCatalogModel;
