import { NextRequest, NextResponse } from 'next/server';
import { getPostsData } from '@/server/repositories/post.repository';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;

    const data = await getPostsData({
      catalog: params.get('catalog') ?? undefined,
    });

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json({ message: 'Lỗi máy chủ!', error: message, posts: [] }, { status: 500 });
  }
}
