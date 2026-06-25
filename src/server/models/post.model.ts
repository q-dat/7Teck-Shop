import { IPost } from '@/types/type/products/post/post';
import mongoose, { Model, Schema } from 'mongoose';

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
  },
  {
    collection: 'posts',
  }
);

const PostModel: Model<IPost> = mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);

export default PostModel;
