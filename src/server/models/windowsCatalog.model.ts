import { IWindowsCatalog } from '@/types/type/catalogs/windows-catalog/windows-catalog';
import mongoose, { Schema, Model } from 'mongoose';

const WindowsCatalogSchema = new Schema<IWindowsCatalog>(
  {
    w_cat_name: { type: String, required: true },
    w_cat_slug: { type: String, unique: true, index: true },
    w_cat_img: { type: String, required: true },
    w_cat_price: { type: Number, required: true },
    w_cat_status: { type: Number, required: true },
    w_cat_content: { type: String },
    w_cat_processor: {
      w_cat_cpu_technology: { type: String },
      w_cat_core_count: { type: Number },
      w_cat_thread_count: { type: Number },
      w_cat_cpu_speed: { type: String },
      w_cat_max_speed: { type: String },
    },
    w_cat_memory_and_storage: {
      w_cat_ram: { type: String },
      w_cat_ram_type: { type: String },
      w_cat_ram_bus_speed: { type: String },
      w_cat_max_ram_support: { type: String },
      w_cat_hard_drive: { type: [String] },
    },
    w_cat_display: {
      w_cat_screen_size: { type: String },
      w_cat_resolution: { type: String },
      w_cat_refresh_rate: { type: String },
      w_cat_color_coverage: { type: String },
      w_cat_screen_technology: { type: [String] },
    },
    w_cat_graphics_and_audio: {
      w_cat_gpu: { type: String },
      w_cat_audio_technology: { type: String },
    },
    w_cat_connectivity_and_ports: {
      w_cat_ports: { type: [String] },
      w_cat_wireless_connectivity: { type: [String] },
      w_cat_card_reader: { type: String },
      w_cat_webcam: { type: String },
      w_cat_other_features: { type: [String] },
      w_cat_keyboard_backlight: { type: String },
    },
    w_cat_dimensions_weight_battery: {
      w_cat_dimensions: { type: [String] },
      w_cat_material: { type: String },
      w_cat_battery_info: { type: String },
      w_cat_operating_system: { type: String },
      w_cat_release_date: { type: String },
    },
  },
  { collection: 'windowscatalogs' }
);

const WindowsCatalogModel =
  (mongoose.models.WindowsCatalog as Model<IWindowsCatalog> | undefined) ?? mongoose.model<IWindowsCatalog>('WindowsCatalog', WindowsCatalogSchema);

export default WindowsCatalogModel;
