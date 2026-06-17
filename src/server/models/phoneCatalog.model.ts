import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPhoneCatalog extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug?: string;
  img: string;
  price: number;
  status: number;
  content?: string;
  createdAt?: Date;
  updatedAt?: Date;
  configuration_and_memory?: {
    operating_system?: string;
    cpu_chip?: string;
    cpu_speed?: string;
    gpu?: string;
    ram?: string;
    storage_capacity?: string;
    remaining_capacity?: string;
    memory_card?: string;
    contacts?: string;
  };
  camera_and_screen?: {
    rear_camera_resolution?: string;
    rear_camera_video?: string[];
    rear_camera_flash?: string;
    rear_camera_features?: string[];
    front_camera_resolution?: string;
    front_camera_features?: string[];
    screen_technology?: string;
    screen_resolution?: string;
    screen_size?: string;
    max_brightness?: string;
    touchscreen_glass?: string;
  };
  battery_and_charging?: {
    battery_capacity?: string;
    battery_type?: string;
    max_charging_support?: string;
    battery_technology?: string[];
  };
  features?: {
    advanced_security?: string[];
    special_features?: string[];
    water_dust_resistant?: string;
    voice_recording?: string[];
    radio?: string[];
    video_playback?: string;
    music_playback?: string[];
  };
  connectivity?: {
    mobile_network?: string;
    sim?: string;
    wifi?: string[];
    gps?: string[];
    bluetooth?: string;
    charging_connection_port?: string;
    headphone_jack?: string;
    other_connectivity?: string;
  };
  design_and_material?: {
    design?: string;
    material?: string;
    dimensions_and_weight?: string;
    release_date?: string;
    brand?: string;
  };
}

const PhoneCatalogSchema = new Schema<IPhoneCatalog>(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true, index: true },
    img: { type: String, required: true },
    price: { type: Number, required: true },
    status: { type: Number, required: true },
    content: { type: String },
    configuration_and_memory: {
      operating_system: { type: String },
      cpu_chip: { type: String },
      cpu_speed: { type: String },
      gpu: { type: String },
      ram: { type: String },
      storage_capacity: { type: String },
      remaining_capacity: { type: String },
      memory_card: { type: String },
      contacts: { type: String },
    },
    camera_and_screen: {
      rear_camera_resolution: { type: String },
      rear_camera_video: { type: [String] },
      rear_camera_flash: { type: String },
      rear_camera_features: { type: [String] },
      front_camera_resolution: { type: String },
      front_camera_features: { type: [String] },
      screen_technology: { type: String },
      screen_resolution: { type: String },
      screen_size: { type: String },
      max_brightness: { type: String },
      touchscreen_glass: { type: String },
    },
    battery_and_charging: {
      battery_capacity: { type: String },
      battery_type: { type: String },
      max_charging_support: { type: String },
      battery_technology: { type: [String] },
    },
    features: {
      advanced_security: { type: [String] },
      special_features: { type: [String] },
      water_dust_resistant: { type: String },
      voice_recording: { type: [String] },
      radio: { type: [String] },
      video_playback: { type: String },
      music_playback: { type: [String] },
    },
    connectivity: {
      mobile_network: { type: String },
      sim: { type: String },
      wifi: { type: [String] },
      gps: { type: [String] },
      bluetooth: { type: String },
      charging_connection_port: { type: String },
      headphone_jack: { type: String },
      other_connectivity: { type: String },
    },
    design_and_material: {
      design: { type: String },
      material: { type: String },
      dimensions_and_weight: { type: String },
      release_date: { type: String },
      brand: { type: String },
    },
  },
  { timestamps: true, collection: 'phonecatalogs' },
);

const PhoneCatalogModel =
  (mongoose.models.PhoneCatalog as Model<IPhoneCatalog> | undefined) ??
  mongoose.model<IPhoneCatalog>('PhoneCatalog', PhoneCatalogSchema);

export default PhoneCatalogModel;
