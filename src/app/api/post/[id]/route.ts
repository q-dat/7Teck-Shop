import { NextResponse } from 'next/server';
import { getPostByIdData } from '@/server/repositories/post.repository';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const data = await getPostByIdData(id);

    if (!data) {
      return NextResponse.json({ message: 'Bài viết không tồn tại!' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json({ message: 'Lỗi máy chủ!', error: message }, { status: 500 });
  }
}
