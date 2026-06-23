import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IPost extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  catalog: string;
  content: string;
  imageUrl: string;
  source?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const PostSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    catalog: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'posts',
  },
);

const PostModel: Model<IPost> = mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);

export default PostModel;
