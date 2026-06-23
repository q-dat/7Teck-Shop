import { connectDB } from '@/lib/mongodb';
import PostModel from '@/server/models/post.model';

export type PostQueryInput = {
  catalog?: string;
};

export async function getPostsData(query: PostQueryInput) {
  await connectDB();

  const filterQuery: Record<string, unknown> = {};

  if (query.catalog) {
    filterQuery.catalog = {
      $regex: new RegExp(query.catalog, 'i'),
    };
  }

  const posts = await PostModel.find(filterQuery).sort({ updatedAt: -1 }).lean();

  const count = await PostModel.countDocuments();

  return {
    message: 'Lấy danh sách bài viết thành công!',
    count,
    visibleCount: posts.length,
    posts,
  };
}

export async function getPostByIdData(id: string) {
  await connectDB();

  const post = await PostModel.findById(id).lean();

  if (!post) return null;

  return {
    message: 'Lấy bài viết thành công!',
    post,
  };
}
