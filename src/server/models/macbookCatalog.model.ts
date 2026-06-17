import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMacbookCatalog extends Document {
  _id: mongoose.Types.ObjectId;
  m_cat_name: string;
  m_cat_slug: string;
  m_cat_img: string;
  m_cat_price: number;
  m_cat_status: number;
  m_cat_content?: string;
  createdAt?: Date;
  updatedAt?: Date;
  m_cat_processor?: {
    m_cat_cpu_technology?: string;
    m_cat_core_count?: number;
    m_cat_thread_count?: number;
    m_cat_cpu_speed?: string;
    m_cat_max_speed?: string;
  };
  m_cat_memory_and_storage?: {
    m_cat_ram?: string;
    m_cat_ram_type?: string;
    m_cat_ram_bus_speed?: string;
    m_cat_max_ram_support?: string;
    m_cat_hard_drive?: string[];
  };
  m_cat_display?: {
    m_cat_screen_size?: string;
    m_cat_resolution?: string;
    m_cat_refresh_rate?: string;
    m_cat_color_coverage?: string;
    m_cat_screen_technology?: string[];
  };
  m_cat_graphics_and_audio?: {
    m_cat_gpu?: string;
    m_cat_audio_technology?: string;
  };
  m_cat_connectivity_and_ports?: {
    m_cat_ports?: string[];
    m_cat_wireless_connectivity?: string[];
    m_cat_card_reader?: string;
    m_cat_webcam?: string;
    m_cat_other_features?: string[];
    m_cat_keyboard_backlight?: string;
  };
  m_cat_dimensions_weight_battery?: {
    m_cat_dimensions?: string[];
    m_cat_material?: string;
    m_cat_battery_info?: string;
    m_cat_operating_system?: string;
    m_cat_release_date?: string;
  };
}

const MacbookCatalogSchema = new Schema<IMacbookCatalog>(
  {
    m_cat_name: { type: String, required: true },
    m_cat_slug: { type: String, unique: true, index: true },
    m_cat_img: { type: String, required: true },
    m_cat_price: { type: Number, required: true },
    m_cat_status: { type: Number, required: true },
    m_cat_content: { type: String },
    m_cat_processor: {
      m_cat_cpu_technology: { type: String },
      m_cat_core_count: { type: Number },
      m_cat_thread_count: { type: Number },
      m_cat_cpu_speed: { type: String },
      m_cat_max_speed: { type: String },
    },
    m_cat_memory_and_storage: {
      m_cat_ram: { type: String },
      m_cat_ram_type: { type: String },
      m_cat_ram_bus_speed: { type: String },
      m_cat_max_ram_support: { type: String },
      m_cat_hard_drive: { type: [String] },
    },
    m_cat_display: {
      m_cat_screen_size: { type: String },
      m_cat_resolution: { type: String },
      m_cat_refresh_rate: { type: String },
      m_cat_color_coverage: { type: String },
      m_cat_screen_technology: { type: [String] },
    },
    m_cat_graphics_and_audio: {
      m_cat_gpu: { type: String },
      m_cat_audio_technology: { type: String },
    },
    m_cat_connectivity_and_ports: {
      m_cat_ports: { type: [String] },
      m_cat_wireless_connectivity: { type: [String] },
      m_cat_card_reader: { type: String },
      m_cat_webcam: { type: String },
      m_cat_other_features: { type: [String] },
      m_cat_keyboard_backlight: { type: String },
    },
    m_cat_dimensions_weight_battery: {
      m_cat_dimensions: { type: [String] },
      m_cat_material: { type: String },
      m_cat_battery_info: { type: String },
      m_cat_operating_system: { type: String },
      m_cat_release_date: { type: String },
    },
  },
  { timestamps: true, collection: 'macbookcatalogs' },
);

const MacbookCatalogModel =
  (mongoose.models.MacbookCatalog as Model<IMacbookCatalog> | undefined) ??
  mongoose.model<IMacbookCatalog>('MacbookCatalog', MacbookCatalogSchema);

export default MacbookCatalogModel;
